"""Services package for SpoedDienst24"""
from .email import (
    send_email,
    send_booking_email,
    send_customer_confirmation_email,
    send_vakman_notification_email,
    send_specific_vakman_notification_email,
    send_vakman_rejection_notification_email,
    send_vakman_approval_email,
    send_vakman_rejection_email,
    send_password_reset_email
)
