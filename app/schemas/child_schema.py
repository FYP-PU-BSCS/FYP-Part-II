# app/schemas/child_schema.py
from marshmallow import Schema, fields, validates, ValidationError, EXCLUDE
from datetime import date, datetime

class ChildRegisterSchema(Schema):
    """
    Finalized High-Performance Child Ingestion Schema.
    Configured to intercept data parsing matrix discrepancies during heavy database mutations.
    """
    class Meta:
        unknown = EXCLUDE

    full_name = fields.Str(required=True, error_messages={"required": "Child identity name is missing"})
    father_name = fields.Str(required=True, allow_none=True) 
    
    full_name_ur = fields.Str(required=False, allow_none=True)
    guardian_ur = fields.Str(required=False, allow_none=True)
    
    # Using Raw format types for manual timestamp fallback control strings conversion
    date_of_birth = fields.Raw(required=False, allow_none=True)
    gender = fields.Str(required=False, allow_none=True, load_default="Unknown")
    
    phone = fields.Str(required=False, allow_none=True)
    house_number = fields.Str(required=False, allow_none=True, load_default="N/A")
    street_number = fields.Str(required=False, allow_none=True, load_default="N/A")
    area = fields.Str(required=False, allow_none=True)
    assigned_team = fields.Str(required=False, allow_none=True)

    @validates('date_of_birth')
    def validate_dob(self, value, **kwargs):
        if not value:
            return
        try:
            if isinstance(value, str):
                check_date = datetime.strptime(value.split('T')[0], '%Y-%m-%d').date()
            elif isinstance(value, (date, datetime)):
                check_date = value
            else:
                return

            if check_date > date.today():
                raise ValidationError("Operational timeline failure: Date of birth cannot reside in future context bounds.")
        except (ValueError, TypeError):
            pass # Keep execution flowing smoothly during raw background imports

    @validates('phone')
    def validate_phone(self, value, **kwargs):
        if not value or value.strip() in ["", "+92"]:
            return

        clean_phone = value.replace("+", "").replace("-", "").replace(" ", "").strip()
        if not clean_phone.isdigit():
            raise ValidationError("Transmission phone routing string must strictly consist of numeric sequences.")

class ChildUpdateSchema(Schema):
    class Meta:
        unknown = EXCLUDE
        
    full_name = fields.Str(required=False)
    father_name = fields.Str(required=False, allow_none=True)
    phone = fields.Str(required=False, allow_none=True)
    vaccination_status = fields.Str(required=False)
    area = fields.Str(required=False, allow_none=True)