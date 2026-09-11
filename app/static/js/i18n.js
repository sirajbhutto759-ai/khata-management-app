/* ==========================================================================
   Khata Management & Accounting App - i18n Translation Dictionary (English & Urdu)
   ========================================================================== */

const TRANSLATIONS = {
  en: {
    // Brand & Navigation
    appName: "Digital Khata Book",
    subName: "Digital Ledger & Accounting",
    dashboard: "Dashboard",
    customers: "Customers",
    transactions: "Transactions / Khata",
    expenses: "Expenses",
    reports: "Reports",
    settings: "Settings & Backup",
    logout: "Logout",
    
    // Auth
    loginTitle: "Login to your Khata",
    registerTitle: "Create Business Account",
    forgotPasswordTitle: "Reset Password",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    businessNameLabel: "Business Name",
    ownerNameLabel: "Owner Name",
    phoneLabel: "Phone Number",
    loginBtn: "Sign In",
    registerBtn: "Register Business",
    forgotPwdLink: "Forgot Password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    
    // Dashboard Cards
    totalReceivable: "Total Receivable",
    totalPayable: "Total Payable",
    todaysIncome: "Today's Income",
    todaysExpenses: "Today's Expenses",
    totalCustomers: "Total Customers",
    totalTransactions: "Total Transactions",
    
    // Quick Buttons
    addCustomer: "Add Customer",
    addTransaction: "Add Transaction",
    addExpense: "Add Expense",
    receivePayment: "Receive Payment",
    giveCredit: "Give Udhaar (Credit)",
    
    // Dashboard Headings
    monthlyChartTitle: "Monthly Cash Flow (Income vs Expenses)",
    topDebtorsTitle: "Top Outstanding Balances",
    recentTxsTitle: "Recent Transactions",
    viewAll: "View All",
    
    // Customer Module
    customerName: "Customer Name",
    address: "Address",
    openingBalance: "Opening Balance",
    currentBalance: "Current Balance",
    notes: "Notes",
    actions: "Actions",
    filterAll: "All Customers",
    filterReceivable: "Receivables (Debtors)",
    filterPayable: "Payables (Creditors)",
    filterZero: "Zero Balance",
    searchCustomerPlaceholder: "Search customer name, phone...",
    viewStatement: "Statement",
    editCustomer: "Edit",
    deleteCustomer: "Delete",
    
    // Customer Statement Page / Modal
    customerStatementTitle: "Customer Account Statement",
    statementPeriod: "Period",
    totalCreditGiven: "Total Udhaar (Credit)",
    totalPaymentReceived: "Total Received (Debit)",
    remainingBalance: "Net Remaining Balance",
    printStatement: "Print Statement",
    downloadPDF: "Download PDF",
    
    // Transactions
    txType: "Type",
    amount: "Amount (PKR)",
    date: "Date",
    description: "Description",
    paymentMethod: "Payment Method",
    receipt: "Receipt / Attachment",
    creditType: "Udhaar (Credit)",
    debitType: "Payment Received (Debit)",
    expenseType: "Expense",
    adjustmentType: "Adjustment",
    editTransaction: "Edit Transaction",
    deleteTransaction: "Delete Transaction",
    confirmDeleteTransaction: "Are you sure you want to delete this transaction?",
    
    // Expenses
    expenseTitle: "Expense Title",
    category: "Category",
    dailyExpenses: "Daily Expenses",
    weeklyExpenses: "Weekly Expenses",
    monthlyExpenses: "Monthly Expenses",
    totalExpenses: "Total Expenses",
    editExpense: "Edit Expense",
    deleteExpense: "Delete Expense",
    confirmDeleteExpense: "Are you sure you want to delete this expense?",
    
    // Reports
    reportsHeader: "Financial Reports & Statement Exports",
    dailyReport: "Daily Report",
    weeklyReport: "Weekly Report",
    monthlyReport: "Monthly Report",
    receivableReport: "Receivables Report",
    payableReport: "Payables Report",
    profitLossReport: "Profit & Loss Statement",
    exportCSV: "Export CSV / Excel",
    netProfit: "Net Profit / Loss",

    // Common
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Are you sure you want to delete this record?",
    confirmReset: "Are you sure you want to restore the database?",
    searchPlaceholder: "Search Khata records...",
    currencySymbol: "DKB",
    noDataFound: "No records found."
  },

  ur: {
    // Brand & Navigation
    appName: "ڈیجیٹل کھاتہ بک",
    subName: "ڈیجیٹل کھاتہ اور اکاؤنٹنگ",
    dashboard: "ڈیش بورڈ",
    customers: "کسٹمرز / گاہک",
    transactions: "لین دین / کھاتہ",
    expenses: "کاروباری اخراجات",
    reports: "مالیاتی رپورٹس",
    settings: "سیٹنگز اور بیک اپ",
    logout: "لاگ آؤٹ",
    
    // Auth
    loginTitle: "اپنے کھاتے میں لاگ ان کریں",
    registerTitle: "نیا کاروباری اکاؤنٹ بنائیں",
    forgotPasswordTitle: "پاس ورڈ ری سیٹ کریں",
    emailLabel: "ای میل ایڈریس",
    passwordLabel: "پاس ورڈ",
    businessNameLabel: "دکان / کاروبار کا نام",
    ownerNameLabel: "مالک کا نام",
    phoneLabel: "فون نمبر",
    loginBtn: "سائن ان کریں",
    registerBtn: "رجسٹر کریں",
    forgotPwdLink: "پاس ورڈ بھول گئے؟",
    noAccount: "کیا اکاؤنٹ نہیں ہے؟",
    haveAccount: "پہلے سے اکاؤنٹ موجود ہے؟",
    
    // Dashboard Cards
    totalReceivable: "کل وصولی (ادھار)",
    totalPayable: "کل واجب الادا (دینا ہے)",
    todaysIncome: "آج کی وصولی / آمدن",
    todaysExpenses: "آج کے اخراجات",
    totalCustomers: "کل کسٹمرز",
    totalTransactions: "کل لین دین",
    
    // Quick Buttons
    addCustomer: "+ نیا کسٹمر شامل کریں",
    addTransaction: "+ لین دین درج کریں",
    addExpense: "+ خرچہ درج کریں",
    receivePayment: "رقم وصول کریں",
    giveCredit: "ادھار دیں",
    
    // Dashboard Headings
    monthlyChartTitle: "ماہانہ آمدن اور اخراجات کا چارٹ",
    topDebtorsTitle: "سب سے زیادہ واجب الوصول ادھار",
    recentTxsTitle: "حالیہ لین دین",
    viewAll: "سب دیکھیں",
    
    // Customer Module
    customerName: "گاہک / کسٹمر کا نام",
    address: "پتہ",
    openingBalance: "ابتدائی بقایا",
    currentBalance: "موجودہ بقایا",
    notes: "تفصیل / نوٹس",
    actions: "کارروائی",
    filterAll: "تمام کسٹمرز",
    filterReceivable: "ادھار والے (وصول کرنا ہے)",
    filterPayable: "دینے والے (واجب الادا)",
    filterZero: "صفر بقایا",
    searchCustomerPlaceholder: "کسٹمر کا نام یا فون نمبر تلاش کریں...",
    viewStatement: "لیجر سٹیٹمنٹ",
    editCustomer: "ترمیم",
    deleteCustomer: "حذف کریں",
    
    // Customer Statement Page / Modal
    customerStatementTitle: "کسٹمر کھاتہ سٹیٹمنٹ",
    statementPeriod: "مدت",
    totalCreditGiven: "کل ادھار دیا",
    totalPaymentReceived: "کل رقم وصول ہوئی",
    remainingBalance: "بقیہ رقم",
    printStatement: "سٹیٹمنٹ پرنٹ کریں",
    downloadPDF: "پی ڈی ایف ڈاؤن لوڈ",
    
    // Transactions
    txType: "قسم",
    amount: "رقم (روپے)",
    date: "تاریخ",
    description: "تفصیل",
    paymentMethod: "ادائیگی کا طریقہ",
    receipt: "رسید / تصویر",
    creditType: "ادھار دیا (Credit)",
    debitType: "رقم وصول کی (Debit)",
    expenseType: "خرچہ",
    adjustmentType: "ایڈجسٹمنٹ",
    editTransaction: "لین دین ترمیم کریں",
    deleteTransaction: "لین دین حذف کریں",
    confirmDeleteTransaction: "کیا آپ واقعی اس لین دین کو حذف کرنا چاہتے ہیں؟",
    
    // Expenses
    expenseTitle: "خرچے کا نام",
    category: "کیٹیگری",
    dailyExpenses: "آج کے اخراجات",
    weeklyExpenses: "ہفتہ وار اخراجات",
    monthlyExpenses: "ماہانہ اخراجات",
    totalExpenses: "کل اخراجات",
    editExpense: "خرچہ ترمیم کریں",
    deleteExpense: "خرچہ حذف کریں",
    confirmDeleteExpense: "کیا آپ واقعی اس خرچے کو حذف کرنا چاہتے ہیں؟",
    
    // Reports
    reportsHeader: "مالیاتی رپورٹس اور لیجر ایکسپورٹ",
    dailyReport: "روزانہ کی رپورٹ",
    weeklyReport: "ہفتہ وار رپورٹ",
    monthlyReport: "ماہانہ رپورٹ",
    receivableReport: "ادھار وصولی رپورٹ",
    payableReport: "واجب الادا رپورٹ",
    profitLossReport: "نفع و نقصان کی رپورٹ",
    exportCSV: "ایکسل / CSV ڈاؤن لوڈ",
    netProfit: "خالص منافع / نقصان",

    // Common
    save: "محفوظ کریں",
    cancel: "منسوخ",
    confirmDelete: "کیا آپ واقعی اس ریکارڈ کو حذف کرنا چاہتے ہیں؟",
    confirmReset: "کیا آپ واقعی ڈیٹا بیس ریسٹور کرنا چاہتے ہیں؟",
    searchPlaceholder: "کھاتے میں تلاش کریں...",
    currencySymbol: "DKB",
    noDataFound: "کوئی ریکارڈ نہیں ملا۔"
  }
};

let currentLang = localStorage.getItem("khata_lang") || "en";

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS["en"][key] || key;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("khata_lang", lang);
  document.documentElement.setAttribute("dir", lang === "ur" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", lang);
  
  const langBtn = document.getElementById("lang-toggle-btn");
  if (langBtn) {
    langBtn.textContent = lang === "ur" ? "English" : "اردو";
  }

  // Translate all DOM elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (k && TRANSLATIONS[lang] && TRANSLATIONS[lang][k]) {
      el.textContent = TRANSLATIONS[lang][k];
    }
  });

  // Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const k = el.getAttribute("data-i18n-placeholder");
    if (k && TRANSLATIONS[lang] && TRANSLATIONS[lang][k]) {
      el.placeholder = TRANSLATIONS[lang][k];
    }
  });

  // Trigger app re-render if loaded
  if (window.renderCurrentView) {
    window.renderCurrentView();
  }
}
