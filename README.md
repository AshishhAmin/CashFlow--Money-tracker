# 💸 CashFlow - Modern Money Tracker

A beautiful, mobile-first personal finance application built with React and Firebase. Track your income, expenses, and budget with style.

![CashFlow Banner](public/cashflow-logo.svg)

## ✨ Features

-   **💰 Transaction Tracking**: Easily record income and expenses.
-   **📅 Visual Calendar**: View your spending habits on a monthly calendar with daily indicators.
-   **💳 Card Management**: specific spending limits for different cards/accounts.
-   **🔔 Smart Notifications**: Get alerted when you approach your budget limits or freeze cards.
-   **📊 Analytics**: Visualize your cash flow with interactive charts.
-   **📱 Mobile Responsive**: Optimized for a native-app-like experience on mobile devices.
-   **🔄 Cloud Sync**: Real-time data synchronization using Firebase Firestore.
-   **🔒 Secure**: Authentication and data protection powered by Firebase.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **Charts**: Recharts
-   **Backend**: Firebase (Auth, Firestore)

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AshishhAmin/CashFlow--Money-tracker.git
    cd cashflow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Firebase configuration keys:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173` (or the network URL shown in the terminal).

## 📱 Mobile Access (Local)

To test on your phone while running locally:
1.  Ensure your phone and computer are on the same Wi-Fi.
2.  Run `npm run dev`.
3.  Enter the **Network URL** (e.g., `http://192.168.x.x:5173`) in your phone's browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
