from datetime import datetime, date
from app.extensions import db
from dateutil.relativedelta import relativedelta
import random
import string
import uuid

class Certificate(db.Model):
    __tablename__ = 'certificates'
    
    id = db.Column(db.Integer, primary_key=True)
    # Change to UUID to match children.id
    child_id = db.Column(db.String(36), db.ForeignKey('children.id'), nullable=False, unique=True)
    certificate_number = db.Column(db.String(50), unique=True, nullable=False)
    certificate_date = db.Column(db.Date, nullable=False, default=date.today)
    
    issued_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    issued_area = db.Column(db.String(50), nullable=False)
    issued_team = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='active')
    
    child = db.relationship('Child', back_populates='certificates')

    @staticmethod
    def generate_certificate_number():
        """Generates ID like CERT-20260113-2700"""
        date_str = date.today().strftime('%Y%m%d')
        random_digits = ''.join(random.choices(string.digits, k=4))
        return f"CERT-{date_str}-{random_digits}"

    def to_dict(self):
        history_data = []
        if self.child and self.child.vaccinations:
            for vax in self.child.vaccinations:
                if vax.status and vax.status.lower() == 'vaccinated':
                    history_data.append({
                        'dose': vax.dose_number if vax.dose_number else 1,
                        'campaign': vax.campaign.name if vax.campaign else "National Campaign",
                        'date': vax.administered_date.strftime('%d %b %Y') if vax.administered_date else "N/A"
                    })

        return {
            'id': self.certificate_number,
            'db_id': self.id,
            'name': self.child.full_name if self.child else "Unknown",
            'guardian': self.child.father_name if self.child else "N/A",
            'dob': self.child.date_of_birth.strftime('%d %b %Y') if self.child and self.child.date_of_birth else "N/A",
            'history': history_data,
            'status': self.status,
            'date': self.certificate_date.isoformat()
        }

    @classmethod
    def auto_generate_for_eligible(cls, system_user_id):
        from app.models import Child
        
        five_years_ago = date.today() - relativedelta(years=5)
        
        eligible_children = Child.query.filter(
            Child.date_of_birth <= five_years_ago
        ).filter(~Child.id.in_(db.session.query(cls.child_id))).all()

        generated_count = 0
        for child in eligible_children:
            has_vax = False
            if child.vaccinations:
                has_vax = any(v.status.lower() == 'vaccinated' for v in child.vaccinations if v.status)

            if has_vax:
                new_cert = cls(
                    child_id=child.id,
                    certificate_number=cls.generate_certificate_number(),
                    issued_by=system_user_id,
                    issued_area=getattr(child, 'area', 'National') or 'National',
                    issued_team=getattr(child, 'assigned_team', 'Registry') or 'Registry'
                )
                db.session.add(new_cert)
                generated_count += 1
        
        db.session.commit()
        return generated_count