#!/bin/bash

# This script is designed to remove imports from emergent.sh and replace instances of 'Stripe' with 'Mollie'

# File paths
file_path="emergent.sh"

# Remove imports from emergent.sh
if [ -f "$file_path" ]; then
    sed -i '/^import/d' "$file_path"
    echo "Removed imports from $file_path"
else
    echo "$file_path does not exist"
fi

# Replace 'Stripe' with 'Mollie'
sed -i 's/Stripe/Mollie/g' "$file_path"
echo "Replaced 'Stripe' with 'Mollie' in $file_path"