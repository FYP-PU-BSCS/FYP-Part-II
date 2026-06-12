from marshmallow import Schema, fields, validates, validates_schema, ValidationError
from app.utils.validators import Validators

class UserSignupSchema(Schema):
    """
    Schema for User Registration.
    Updated to match React Frontend field names (fullName, phoneNumber).
    """
    # Changed 'name' to 'fullName' to match frontend state
    name = fields.Str(required=True)
    cnic = fields.Str(required=True)
    email = fields.Email(required=True)
    phone = fields.Str(required=True) 
    password = fields.Str(required=True)
    role = fields.Str(required=True)
    area = fields.Str(required=False, allow_none=True) 

    @validates('cnic')
    def validate_cnic_field(self, value, **kwargs):
        """Validates CNIC format."""
        is_valid, message = Validators.validate_cnic(value)
        if not is_valid:
            raise ValidationError(message)

    @validates('phone')
    def validate_phone_field(self, value, **kwargs):
        """Validates Phone format (+92)."""
        is_valid, message = Validators.validate_phone(value)
        if not is_valid:
            raise ValidationError(message)

    @validates('role')
    def validate_role_field(self, value, **kwargs):
        """Ensures the role is valid for the system."""
        allowed_roles = ['UCMO', 'AreaIncharge', 'Area Incharge', 'Team']
        if value not in allowed_roles:
            raise ValidationError(f"Invalid Role: {value}")

    @validates_schema
    def validate_role_area_logic(self, data, **kwargs):
        """
        Logic to ensure Area is provided for Team members.
        """
        role = data.get('role')
        area = data.get('area')
        
        # Team members MUST provide an area
        if role == 'Team' and not area:
            raise ValidationError("Area is required for the Team role.", "area")
        
        # Clean area for non-team roles to keep DB clean
        if role in ['UCMO', 'AreaIncharge', 'Area Incharge']:
            data['area'] = None

class UserLoginSchema(Schema):
    """
    Schema for User Authentication using CNIC and Password.
    """
    cnic = fields.Str(required=True)
    password = fields.Str(required=True)