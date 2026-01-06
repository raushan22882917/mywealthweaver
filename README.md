
# 📈 US Dividend Intelligence Platform

A modern platform that provides **accurate, structured, and easy-to-understand dividend information for the US stock market**.  
Built for long-term investors, dividend income seekers, and finance learners.

---

## 🚀 Overview

The **US Dividend Intelligence Platform** helps users:
- Discover high-quality dividend-paying US stocks
- Track dividend income and upcoming payments
- Analyze dividend safety, growth, and sustainability
- Build and monitor a dividend-focused portfolio

The platform focuses on **clarity, accuracy, and trust** rather than speculative stock tips.

---

## 🎯 Key Features

### 🔍 Dividend Stock Screener
- Filter stocks by:
  - Dividend Yield
  - Sector
  - Market Capitalization
  - Dividend Frequency (Monthly / Quarterly)
  - Dividend Growth Years
- Sort by yield, safety score, or market cap

---

### 📄 Stock Detail Pages
Each stock has a dedicated page including:
- Company overview
- Current dividend yield
- Ex-dividend date & payment date
- Dividend history (10–20 years)
- Dividend growth rate (CAGR)
- Payout ratio & cash-flow coverage
- Dividend safety score

---

### 📅 Dividend Calendar
- Upcoming dividend payments
- Ex-dividend alerts
- Monthly and weekly views
- Watchlist-based filtering

---

### 📄 PDF Analysis & Chat
- Upload and analyze financial documents
- AI-powered chat interface using **Google Gemini**
- Extract key insights from earnings reports, 10-K filings, and other documents
- Interactive Q&A with document content

---

### ⭐ Dividend Safety & Quality Scoring
Custom scoring system based on:
- Earnings payout ratio
- Free cash flow coverage
- Debt-to-equity ratio
- Revenue consistency
- Dividend cut history

Score levels:
- 🟢 Safe
- 🟡 Moderate
- 🔴 Risky

---

### 💼 Portfolio & Income Tracker
(For registered users)
- Track owned shares
- Annual & monthly dividend income
- Yield on cost
- Upcoming dividend payments
- Dividend reinvestment (DRIP) simulation

---

### 🧠 Educational Section
- What is a dividend?
- How dividend yield works
- Ex-dividend vs payment date
- Dividend growth investing basics
- Risks of high dividend yields

---

## 🛠 Tech Stack

### Frontend
- Next.js / React
- Tailwind CSS
- Chart.js / Recharts

### Backend
- Node.js or FastAPI
- REST APIs
- Scheduled cron jobs for dividend updates

### AI Integration
- **Google Gemini AI** for PDF document analysis and chat
- Intelligent document processing and Q&A capabilities

### Database
- PostgreSQL (core financial data)
- Redis (caching & performance)

---

## 📊 Data Sources

Market and dividend data sourced from:
- :contentReference[oaicite:0]{index=0}
- :contentReference[oaicite:1]{index=1}
- :contentReference[oaicite:2]{index=2}
- :contentReference[oaicite:3]{index=3}
- :contentReference[oaicite:4]{index=4}
- :contentReference[oaicite:5]{index=5} (company filings)

> ⚠️ Data may be delayed. Always verify before making investment decisions.

---

## 🔔 Alerts & Notifications
- Ex-dividend reminders
- Dividend cut warnings
- Yield threshold alerts
- Portfolio income updates

---

## 💰 Monetization (Planned)

### Free Tier
- Dividend screener
- Stock pages
- Dividend calendar
- Limited portfolio tracking

### Premium Tier
- Advanced dividend safety scores
- Unlimited portfolios
- AI-based dividend insights
- Email & push alerts
- CSV / Excel export

---

## 🔐 Compliance & Disclaimer

This platform is for **educational and informational purposes only**.

- Not financial advice
- No buy/sell recommendations
- No personalized investment guidance

Always consult a certified financial advisor before investing.

---

## 📌 Roadmap

- [ ] AI-powered dividend sustainability analysis
- [ ] Dividend aristocrats & kings tagging
- [ ] Mobile-first UI
- [ ] Dark mode
- [ ] Multi-currency income view
- [ ] Tax estimation (US dividends)

---

## ⚙️ Setup & Configuration

### Gemini AI Integration
To use the PDF analysis and chat features:

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key

2. **Configure Environment Variables**
   - Create a `.env.local` file in the project root
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_actual_api_key_here
     ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [GEMINI_SETUP.md](./GEMINI_SETUP.md).

---

## 🤝 Contributing

Contributions are welcome!
- Fork the repository
- Create a feature branch
- Submit a pull request

---

## 📄 License

MIT License  
Free to use, modify, and distribute.

---

## 📬 Contact

For suggestions, feedback, or collaboration:
- Email: support@yourplatform.com
- GitHub Issues: Use the Issues tab

---

**Built with ❤️ for dividend investors**
