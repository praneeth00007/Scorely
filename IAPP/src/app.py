import json
import os
import sys
import zipfile

# iExec TEE I/O Directories (Protocol Defaults)
IEXEC_IN = os.getenv('IEXEC_IN', '/iexec_in')
IEXEC_OUT = os.getenv('IEXEC_OUT', '/iexec_out')
RESULT_FILE = "result.json"

def _check_non_neg(val, name):
    if not isinstance(val, (int, float)) or val < 0:
        raise ValueError(f"Field '{name}' must be a non-negative number. Got: {val}")
    return val

def validate_input(data: dict):
    """
    Validates the input against strict hard-fail rules.
    Raises ValueError with explicit message if validation fails.
    """
    required_sections = ["income", "liabilities", "creditUtilization", "creditHistory", "creditMix", "newCredit"]
    for section in required_sections:
        if section not in data:
            raise ValueError(f"Missing required section: {section}")

    # Income
    income = data["income"]
    annual_salary = _check_non_neg(income.get("annualSalaryUSD"), "annualSalaryUSD")
    _check_non_neg(income.get("otherIncomeUSD"), "otherIncomeUSD")
    _check_non_neg(income.get("employmentStabilityMonths"), "employmentStabilityMonths")

    # Liabilities
    liabs = data["liabilities"]
    _check_non_neg(liabs.get("totalOutstandingDebtUSD"), "totalOutstandingDebtUSD")
    monthly_debt = _check_non_neg(liabs.get("monthlyDebtPaymentUSD"), "monthlyDebtPaymentUSD")

    # Credit Utilization
    util = data["creditUtilization"]
    total_limit = _check_non_neg(util.get("totalCreditLimitUSD"), "totalCreditLimitUSD")
    current_utilized = _check_non_neg(util.get("currentUtilizedUSD"), "currentUtilizedUSD")

    # Credit History
    hist = data["creditHistory"]
    oldest_months = _check_non_neg(hist.get("oldestAccountMonths"), "oldestAccountMonths")
    avg_months = _check_non_neg(hist.get("averageAccountAgeMonths"), "averageAccountAgeMonths")
    late = hist.get("latePayments", {})
    _check_non_neg(late.get("30D"), "latePayments.30D")
    _check_non_neg(late.get("60D"), "latePayments.60D")
    _check_non_neg(late.get("90D"), "latePayments.90D")

    # Credit Mix
    mix = data["creditMix"]
    _check_non_neg(mix.get("creditCards"), "creditCards")
    _check_non_neg(mix.get("installmentLoans"), "installmentLoans")
    _check_non_neg(mix.get("mortgage"), "mortgage")

    # New Credit
    new_cred = data["newCredit"]
    _check_non_neg(new_cred.get("hardInquiriesLast12Months"), "hardInquiriesLast12Months")
    _check_non_neg(new_cred.get("newAccountsLast12Months"), "newAccountsLast12Months")

    # LOGIC VALIDATIONS
    if total_limit <= 0:
        raise ValueError("totalCreditLimitUSD must be greater than 0")
    
    if current_utilized > total_limit:
        raise ValueError("currentUtilizedUSD cannot exceed totalCreditLimitUSD")

    monthly_income = annual_salary / 12
    if monthly_debt > monthly_income:
        raise ValueError("monthlyDebtPaymentUSD cannot exceed monthly income (annualSalaryUSD / 12)")

    if oldest_months < avg_months:
        raise ValueError("oldestAccountMonths must be greater than or equal to averageAccountAgeMonths")

def calculate_payment_history(history: dict) -> int:
    """
    1) Payment History (35 points max)
    - Start with 35
    - Subtract penalties
    - Floor at 0
    """
    score = 35
    late = history.get("latePayments", {})
    
    score -= (late.get("30D", 0) * 5)
    score -= (late.get("60D", 0) * 10)
    score -= (late.get("90D", 0) * 20)
    
    return max(0, score)

def calculate_utilization(credit_util: dict) -> int:
    """
    2) Credit Utilization (30 points max)
    utilization = currentUtilizedUSD / totalCreditLimitUSD
    """
    current = credit_util.get("currentUtilizedUSD", 0)
    limit = credit_util.get("totalCreditLimitUSD", 1) # Validated > 0
    
    ratio = current / limit
    
    if ratio < 0.10: return 30
    if 0.10 <= ratio < 0.30: return 25
    if 0.30 <= ratio < 0.50: return 15
    if 0.50 <= ratio <= 0.75: return 5
    return 0

def calculate_history_length(history: dict) -> int:
    """
    3) Credit History Length (15 points max)
    """
    oldest = history.get("oldestAccountMonths", 0)
    
    if oldest >= 120: return 15
    if 60 <= oldest < 120: return 10
    if 24 <= oldest < 60: return 5
    return 0

def calculate_credit_mix(mix: dict) -> int:
    """
    4) Credit Mix (10 points max)
    """
    types_count = 0
    if mix.get("creditCards", 0) > 0: types_count += 1
    if mix.get("installmentLoans", 0) > 0: types_count += 1
    if mix.get("mortgage", 0) > 0: types_count += 1
    
    if types_count >= 3: return 10
    if types_count == 2: return 7
    if types_count == 1: return 3
    return 0

def calculate_new_credit(new_cred: dict) -> int:
    """
    5) New Credit / Inquiries (10 points max)
    """
    inquiries = new_cred.get("hardInquiriesLast12Months", 0)
    
    if inquiries == 0: return 10
    if 1 <= inquiries <= 2: return 7
    if 3 <= inquiries <= 5: return 3
    return 0

def get_risk_grade(score: int):
    if 800 <= score <= 850: return "A", "LOW RISK"
    if 740 <= score <= 799: return "B", "LOW-MEDIUM"
    if 670 <= score <= 739: return "C", "MEDIUM"
    if 580 <= score <= 669: return "D", "HIGH"
    return "E", "VERY HIGH" # < 580

def calculate_score(data: dict) -> dict:
    validate_input(data) # Hard fail if invalid
    
    p_hist = calculate_payment_history(data["creditHistory"])
    p_util = calculate_utilization(data["creditUtilization"])
    p_len = calculate_history_length(data["creditHistory"])
    p_mix = calculate_credit_mix(data["creditMix"])
    p_new = calculate_new_credit(data["newCredit"])
    
    raw_score = p_hist + p_util + p_len + p_mix + p_new
    
    # Final Score Normalization
    # finalScore = 300 + (rawScore * 5.5)
    final_score_float = 300 + (raw_score * 5.5)
    final_score = round(final_score_float)
    
    # Clamp
    final_score = max(300, min(850, final_score))
    
    grade, risk = get_risk_grade(final_score)
    
    return {
        "creditScore": int(final_score),
        "grade": grade,
        "riskLevel": risk,
        "factorBreakdown": {
            "paymentHistory": p_hist,
            "creditUtilization": p_util,
            "historyLength": p_len,
            "creditMix": p_mix,
            "newCredit": p_new
        }
    }

def main():
    print("[SCORELY] Initializing Strict Deterministic Engine...")
    
    try:
        # Define writable temp directory for extraction
        TEMP_DIR = '/tmp/iexec_input'
        os.makedirs(TEMP_DIR, exist_ok=True)
        
        # 1. Extraction Phase
        for root, dirs, files in os.walk(IEXEC_IN):
            for file in files:
                filepath = os.path.join(root, file)
                if zipfile.is_zipfile(filepath) and not file.startswith('.') and not file.endswith('.json'):
                    print(f"[SCORELY] Extracting compressed input: {file}")
                    try:
                        with zipfile.ZipFile(filepath, 'r') as z:
                            z.extractall(TEMP_DIR)
                    except Exception as e:
                        print(f"[SCORELY WARNING] Failed to extract {file}: {e}")

        # 2. Discovery Phase
        input_data = {}
        search_dirs = [TEMP_DIR, IEXEC_IN]
        
        # Priority 0: Check for Requester Secret
        secret_1 = os.getenv('IEXEC_REQUESTER_SECRET_1')
        if secret_1:
            try:
                data = json.loads(secret_1)
                if isinstance(data, str): data = json.loads(data)
                input_data = data
                print("[SCORELY] Loaded input from Secret 1")
            except: pass

        # Priority 1: Scan files
        if not input_data:
            for search_path in search_dirs:
                if input_data: break
                for root, dirs, files in os.walk(search_path):
                    if input_data: break
                    for file in sorted(files):
                        if file.startswith('.') or file.endswith('computed.json') or file == RESULT_FILE: continue
                        
                        filepath = os.path.join(root, file)
                        try:
                            with open(filepath, 'rb') as fb:
                                raw_bytes = fb.read()
                            
                            if not raw_bytes: continue
                            
                            # Cleanup TEE prefixes
                            if len(raw_bytes) > 4 and raw_bytes[0] in [0xb1, 0xb2, 0xb3]:
                                raw_bytes = raw_bytes[4:]
                                
                            content = raw_bytes.decode('utf-8', errors='ignore').strip()
                            # Basic cleanup
                            if "\\\"" in content: content = content.replace("\\\"", "\"")
                            
                            # Extract JSON substring
                            s = content.find('{')
                            e = content.rfind('}')
                            if s != -1 and e != -1:
                                json_str = content[s:e+1]
                                try:
                                    data = json.loads(json_str)
                                    # Check for expected structure or wrapped structure
                                    candidate = data
                                    if "income" in candidate: 
                                        input_data = candidate
                                    else:
                                        # Check values for nested data
                                        for val in candidate.values():
                                            if isinstance(val, dict) and "income" in val:
                                                input_data = val
                                                break
                                    if input_data:
                                        print(f"[SCORELY] Loaded input from {file}")
                                        break
                                except: pass
                        except: pass

        if not input_data:
            raise FileNotFoundError("No valid JSON input found containing 'income' section.")

        # 3. Process
        result = calculate_score(input_data)
        print(f"[SCORELY] Scoring complete. Final Score: {result['creditScore']}")

        # 4. Write Output
        output_path = os.path.join(IEXEC_OUT, RESULT_FILE)
        with open(output_path, 'w') as f:
            json.dump(result, f, indent=4)
            
        with open(os.path.join(IEXEC_OUT, 'computed.json'), 'w') as f:
            json.dump({ "deterministic-output-path": output_path }, f)

    except Exception as e:
        print(f"[SCORELY ERROR] {str(e)}")
        # In case of error, we must still produce a deterministic output or fail hard.
        # User requested "throw explicit error", but in TEE context usually we write the error to result 
        # so the requester knows why it failed.
        error_result = {
            "error": str(e),
            "status": "FAILURE"
        }
        output_path = os.path.join(IEXEC_OUT, RESULT_FILE)
        with open(output_path, 'w') as f:
            json.dump(error_result, f, indent=4)
        with open(os.path.join(IEXEC_OUT, 'computed.json'), 'w') as f:
            json.dump({ "deterministic-output-path": output_path }, f)
        sys.exit(1)

if __name__ == "__main__":
    main()