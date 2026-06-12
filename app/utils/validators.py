import re
import phonenumbers
from email_validator import validate_email, EmailNotValidError

class Validators:
    
    @staticmethod
    def validate_cnic(cnic):
        """Validate Pakistani CNIC format: XXXXX-XXXXXXX-X (15 chars)"""
        # Matches your React frontend mask logic
        pattern = r'^\d{5}-\d{7}-\d{1}$'
        if not re.match(pattern, cnic):
            return False, "Invalid CNIC format. Use: XXXXX-XXXXXXX-X"
        
        # Ensure total digits are exactly 13
        cnic_digits = cnic.replace('-', '')
        if len(cnic_digits) != 13:
            return False, "CNIC must contain exactly 13 digits"
            
        return True, "Valid CNIC"
    
    @staticmethod
    def validate_phone(phone):
        """Validate Pakistani phone number starting with +92"""
        try:
            # Parse number with Pakistan context
            parsed = phonenumbers.parse(phone, "PK")
            if not phonenumbers.is_valid_number(parsed):
                return False, "Invalid phone number"
            
            # Mobile numbers in PK must start with 3 (after country code)
            national_num = str(parsed.national_number)
            if not national_num.startswith('3'):
                return False, "Must be a valid mobile number (e.g., 03xx...)"
                
            return True, "Valid phone number"
        except Exception:
            return False, "Invalid phone number format. Use: +923xxxxxxxxx"
    
    @staticmethod
    def validate_email(email):
        """Validate email address format"""
        try:
            validate_email(email)
            return True, "Valid email"
        except EmailNotValidError as e:
            return False, str(e)
    
    @staticmethod
    def validate_password(password):
        """
        Validate password to match Frontend: 7-20 characters, Alphanumeric.
        """
        # Matching your React 'handleSubmit' logic
        if len(password) < 7 or len(password) > 20:
            return False, "Password must be between 7 and 20 characters"
        
        if not re.search(r"[a-zA-Z]", password) or not re.search(r"[0-9]", password):
            return False, "Password must contain both letters and numbers"
        
        return True, "Valid password"
    
    @staticmethod
    def validate_role_area(role, area):
        """Validate role and area logic for UCMO, AreaIncharge, and Team"""
        # Handling both 'AreaIncharge' and 'Area Incharge' for safety
        valid_roles = ['UCMO', 'AreaIncharge', 'Area Incharge', 'Team']
        
        if role not in valid_roles:
            return False, f"Invalid Role. Must be one of: {', '.join(['UCMO', 'AreaIncharge', 'Team'])}"
        
        if role == 'Team':
            valid_areas = ['Area A', 'Area B', 'Area C']
            if not area or area not in valid_areas:
                return False, "Area A, B, or C is required for Team members"
        else:
            # For UCMO or AreaIncharge, area must be empty/None
            if area:
                return False, f"Area should not be assigned to {role}"
        
        return True, "Valid role-area combination"