# Mollie Payments Integration

import requests

class MolliePayments:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.mollie.com/v2/'

    def create_payment(self, amount, description, redirect_url, webhook_url):
        payload = {
            'amount': {
                'currency': 'EUR',
                'value': str(amount),  # Amount in euros
            },
            'description': description,
            'redirectUrl': redirect_url,
            'webhookUrl': webhook_url,
        }

        headers = {
            'Authorization': f'Bearer {self.api_key}'
        }

        response = requests.post(f'{self.base_url}payments', json=payload, headers=headers)
        return response.json()

    def get_payment(self, payment_id):
        headers = {
            'Authorization': f'Bearer {self.api_key}'
        }

        response = requests.get(f'{self.base_url}payments/{payment_id}', headers=headers)
        return response.json()

    # You can add more methods as needed for your integration.
