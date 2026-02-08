#!/bin/bash
# Configure Firestore Security Rules

cd c:\Users\DAS\dts-frontend

echo "Configuring Firestore security rules..."
firebase deploy --only firestore:rules

echo "✅ Rules deployed!"
echo "App should now connect to Firestore successfully."
