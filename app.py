import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import yfinance as yf
from datetime import date

# =========================================================
# FINPILOT AI — CONFIGURATION
# =========================================================

st.set_page_config(
    page_title="FinPilot AI | Financial Intelligence",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =========================================================
# DESIGN SYSTEM
# =========================================================

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    .stApp {
        background: #0b1020;
        color: #e5e7eb;
    }

    [data-testid="stSidebar"] {
        background: #10182a;
        border-right: 1px solid #26324a;
    }

    .hero {
        padding: 30px;
        border-radius: 18px;
        background: linear-gradient(120deg, #142746, #10182a 70%);
        border: 1px solid #263b5c;
        margin-bottom: 22px;
    }

    .hero h1 {
        color: #f8fafc;
        font-size: 36px;
        font-weight: 800;
        margin-bottom: 8px;
    }

    .hero p {
        color: #a9b9d0;
        font-size: 15px;
    }

    .eyebrow {
        color: #60a5fa;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-size: 11px;
        font-weight: 700;
    }

    .section-title {
        font-size: 23px;
        font-weight: 700;
        color: #f8fafc;
        margin-top: 20px;
        margin-bottom: 10px;
    }

    .small-note {
        color: #94a3b8;
        font-size: 12px;
    }

    [data-testid="stMetric"] {
        background: #121d32;
        border: 1px solid #26344e;
        padding: 17px;
        border-radius: 12px;
    }

    [data-testid="stMetricLabel"] {
        color: #9fb1ca;
    }

    [data-testid="stMetricValue"] {
        color: #f8fafc;
    }

    .stButton button {
        border-radius: 8px;
        font-weight: 600;
    }

    div[data-testid="stPlotlyChart"] {
        border: 1px solid #26344e;
        border-radius: 12px;
        padding: 8px;
        background: #10182a;
    }
</style>
""", unsafe_allow_html=True)

# =========================================================
# HELPER FUNCTIONS
# =========================================================

@st.cache_data(ttl=300, show_spinner=False)
def get_stock_data(ticker, period="1y"):
    """Download historical market data. Cache for five minutes."""
    try:
        data = yf.download(
            ticker,
            period=period,
            auto_adjust=True,
            progress=False
        )

        if data is None or data.empty:
            return pd.DataFrame()

        # Handle the MultiIndex columns returned by some yfinance versions.
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)

        return data.dropna(subset=["Close"])

    except Exception:
        return pd.DataFrame()


def money_inr(value):
    """Format a number in Indian rupees."""
    return f"₹{value:,.2f}"


def make_price_chart(data, title="Price History"):
    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=data.index,
        y=data["Close"],
        mode="lines",
        name="Adjusted Close",
        line=dict(color="#60a5fa", width=2.5),
        fill="tozeroy",
        fillcolor="rgba(96,165,250,0.08)"
    ))

    fig.update_layout(
        title=title,
        template="plotly_dark",
        paper_bgcolor="#10182a",
        plot_bgcolor="#10182a",
        font=dict(color="#dbeafe"),
        margin=dict(l=15, r=15, t=55, b=15),
        height=390,
        xaxis_title="Date",
        yaxis_title="Price",
        hovermode="x unified",
        showlegend=False
    )

    fig.update_xaxes(showgrid=False)
    fig.update_yaxes(gridcolor="#26344e")

    return fig


def calculate_risk(returns, confidence=0.95):
    """Calculate historical VaR and CVaR from daily simple returns."""
    returns = pd.Series(returns).dropna()

    if len(returns) < 2:
        return None

    # Loss is represented as a positive number.
    losses = -returns
    var = losses.quantile(confidence)
    cvar = losses[losses >= var].mean()

    return {
        "var": float(var),
        "cvar": float(cvar),
        "volatility": float(returns.std() * np.sqrt(252)),
        "observations": int(len(returns))
    }


# =========================================================
# SIDEBAR NAVIGATION
# =========================================================

with st.sidebar:
    st.markdown("## 📈 FinPilot AI")
    st.caption("Financial Intelligence Platform")
    st.divider()

    page = st.radio(
        "NAVIGATION",
        [
            "Dashboard",
            "Stock Research",
            "Portfolio Analyzer",
            "Risk Analytics",
            "SIP Calculator",
            "AI Assistant"
        ],
        label_visibility="collapsed"
    )

    st.divider()

    st.markdown("### Platform")
    st.caption("Research • Analytics • Risk")
    st.caption("Version 0.1 | Competition Prototype")

    st.divider()
    st.caption("Market data powered by Yahoo Finance.")
    st.caption("Data availability and delays may vary.")


# =========================================================
# DASHBOARD
# =========================================================

if page == "Dashboard":

    st.markdown("""
    <div class="hero">
        <div class="eyebrow">YOUR FINANCIAL COMMAND CENTRE</div>
        <h1>Welcome to FinPilot AI.</h1>
        <p>
            Research markets, analyse portfolios, measure risk and
            make more informed financial decisions from one workspace.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="section-title">Market Watch</div>',
                unsafe_allow_html=True)

    st.caption(
        "Illustrative market watchlist. Prices are retrieved from Yahoo Finance "
        "when available and may be delayed."
    )

    market_tickers = {
        "NIFTY 50": "^NSEI",
        "SENSEX": "^BSESN",
        "BANK NIFTY": "^NSEBANK",
        "RELIANCE": "RELIANCE.NS"
    }

    cols = st.columns(4)

    for col, (name, ticker) in zip(cols, market_tickers.items()):
        with col:
            with st.spinner(f"Loading {name}..."):
                data = get_stock_data(ticker, "5d")

            if not data.empty and len(data) >= 1:
                current = float(data["Close"].iloc[-1])

                if len(data) >= 2:
                    previous = float(data["Close"].iloc[-2])
                    change = (
                        (current / previous) - 1
                    ) * 100 if previous else 0
                else:
                    change = 0

                st.metric(
                    name,
                    f"{current:,.2f}",
                    f"{change:+.2f}%"
                )
            else:
                st.metric(name, "Unavailable", "Data unavailable")

    st.markdown('<div class="section-title">Explore the Platform</div>',
                unsafe_allow_html=True)

    c1, c2, c3 = st.columns(3)

    with c1:
        st.markdown("### 🔎 Stock Research")
        st.write("Explore historical prices, returns and price charts.")

    with c2:
        st.markdown("### 🛡️ Risk Analytics")
        st.write("Estimate historical VaR, CVaR and annualised volatility.")

    with c3:
        st.markdown("### 💼 Portfolio Analyzer")
        st.write("Upload historical prices and analyse portfolio risk.")

    st.info(
        "Start with the sidebar to explore individual modules. "
        "Some advanced features are being developed."
    )


# =========================================================
# STOCK RESEARCH
# =========================================================

elif page == "Stock Research":

    st.markdown("## 🔎 Stock Research")
    st.write("Explore historical market data for supported Yahoo Finance tickers.")

    ticker = st.text_input(
        "Enter a stock or index ticker",
        value="RELIANCE.NS"
    ).strip().upper()

    period = st.selectbox(
        "Historical period",
        ["1mo", "3mo", "6mo", "1y", "2y", "5y"],
        index=3
    )

    if st.button("Analyse Stock", type="primary"):
        if not ticker:
            st.warning("Enter a ticker first.")
        else:
            with st.spinner("Retrieving market data..."):
                data = get_stock_data(ticker, period)

            if data.empty:
                st.error(
                    "No data was returned. Check the ticker and try again."
                )
            else:
                close = data["Close"].dropna()
                latest = float(close.iloc[-1])
                first = float(close.iloc[0])
                total_return = (
                    (latest / first) - 1
                ) * 100 if first else 0

                daily_returns = close.pct_change().dropna()
                annual_vol = (
                    daily_returns.std() * np.sqrt(252) * 100
                    if len(daily_returns) > 1 else 0
                )

                c1, c2, c3 = st.columns(3)

                c1.metric("Latest Adjusted Close", f"{latest:,.2f}")
                c2.metric("Period Return", f"{total_return:+.2f}%")
                c3.metric("Annualised Volatility", f"{annual_vol:.2f}%")

                st.plotly_chart(
                    make_price_chart(data, f"{ticker} — Price History"),
                    use_container_width=True
                )

                st.markdown("### Historical Data")

                st.dataframe(
                    data.tail(20).sort_index(ascending=False),
                    use_container_width=True
                )

                csv = data.to_csv().encode("utf-8")

                st.download_button(
                    "Download Historical Data (CSV)",
                    data=csv,
                    file_name=f"{ticker.replace('.', '_')}_history.csv",
                    mime="text/csv"
                )

    else:
        st.info("Enter a ticker and click Analyse Stock to begin.")


# =========================================================
# PORTFOLIO ANALYZER
# =========================================================

elif page == "Portfolio Analyzer":

    st.markdown("## 💼 Portfolio Analyzer")
    st.write(
        "Upload a CSV or Excel file containing historical asset prices."
    )

    st.markdown("**Required format:** One date column and one column per asset.")

    sample = pd.DataFrame({
        "Date": ["2026-01-01", "2026-01-02", "2026-01-03"],
        "Asset_A": [100, 102, 101],
        "Asset_B": [200, 199, 203],
        "Asset_C": [50, 51, 52]
    })

    st.dataframe(sample, use_container_width=True)

    uploaded_file = st.file_uploader(
        "Upload historical prices",
        type=["csv", "xlsx"]
    )

    if uploaded_file is not None:
        try:
            if uploaded_file.name.endswith(".csv"):
                prices = pd.read_csv(uploaded_file)
            else:
                prices = pd.read_excel(uploaded_file)

            date_col = next(
                (c for c in prices.columns if c.lower() == "date"),
                None
            )

            if date_col is None:
                st.error("Your file must contain a column named Date.")
            else:
                prices[date_col] = pd.to_datetime(
                    prices[date_col], errors="coerce"
                )

                prices = prices.set_index(date_col)
                prices = prices.apply(pd.to_numeric, errors="coerce")
                prices = prices.dropna(how="all").sort_index()

                assets = list(prices.columns)

                if not assets:
                    st.error("No numeric asset-price columns were found.")
                elif len(prices) < 3:
                    st.error("Upload at least three dated price observations.")
                else:
                    st.success(
                        f"Loaded {len(prices)} observations across "
                        f"{len(assets)} assets."
                    )

                    weights_pct = st.text_input(
                        "Portfolio weights (%) in asset-column order",
                        value=",".join(
                            [str(round(100 / len(assets), 2))] * len(assets)
                        )
                    )

                    try:
                        weights = np.array([
                            float(x.strip())
                            for x in weights_pct.split(",")
                        ])

                        if len(weights) != len(assets):
                            st.error(
                                f"Enter exactly {len(assets)} weights."
                            )
                        elif np.any(weights < 0) or weights.sum() <= 0:
                            st.error(
                                "Weights must be non-negative and sum to a "
                                "positive number."
                            )
                        else:
                            weights = weights / weights.sum()

                            st.caption(
                                "Weights are normalised to 100%. "
                                "This prototype uses fixed target weights "
                                "with daily portfolio returns."
                            )

                            asset_returns = prices.pct_change().dropna(how="all")
                            asset_returns = asset_returns.fillna(0)

                            portfolio_returns = asset_returns.dot(weights)
                            cumulative = (
                                (1 + portfolio_returns).cumprod() - 1
                            ) * 100

                            total_return = (
                                (1 + portfolio_returns).prod() - 1
                            ) * 100

                            vol = (
                                portfolio_returns.std() * np.sqrt(252) * 100
                            )

                            c1, c2, c3 = st.columns(3)
                            c1.metric(
                                "Portfolio Return",
                                f"{total_return:+.2f}%"
                            )
                            c2.metric(
                                "Annualised Volatility",
                                f"{vol:.2f}%"
                            )
                            c3.metric(
                                "Number of Assets",
                                str(len(assets))
                            )

                            fig = go.Figure()
                            fig.add_trace(go.Scatter(
                                x=cumulative.index,
                                y=cumulative,
                                mode="lines",
                                name="Cumulative Return",
                                line=dict(color="#60a5fa", width=2.5)
                            ))

                            fig.update_layout(
                                title="Portfolio Cumulative Return",
                                template="plotly_dark",
                                paper_bgcolor="#10182a",
                                plot_bgcolor="#10182a",
                                height=380,
                                yaxis_title="Return (%)"
                            )

                            st.plotly_chart(
                                fig, use_container_width=True
                            )

                    except ValueError:
                        st.error(
                            "Enter valid numeric weights separated by commas."
                        )

        except Exception as exc:
            st.error(f"Unable to read this file: {exc}")


# =========================================================
# RISK ANALYTICS
# =========================================================

elif page == "Risk Analytics":

    st.markdown("## 🛡️ Risk Analytics")
    st.write(
        "Estimate historical market risk using a stock or index's "
        "historical daily returns."
    )

    ticker = st.text_input(
        "Stock or index ticker",
        value="^NSEI",
        key="risk_ticker"
    ).strip().upper()

    period = st.selectbox(
        "Lookback period",
        ["6mo", "1y", "2y", "5y"],
        index=1,
        key="risk_period"
    )

    confidence = st.select_slider(
        "VaR confidence level",
        options=[0.90, 0.95, 0.99],
        value=0.95,
        format_func=lambda x: f"{x:.0%}"
    )

    amount = st.number_input(
        "Portfolio value (₹)",
        min_value=1000.0,
        value=100000.0,
        step=10000.0
    )

    if st.button("Calculate Risk", type="primary"):
        with st.spinner("Calculating historical risk..."):
            data = get_stock_data(ticker, period)

        if data.empty:
            st.error("Market data unavailable. Check the ticker.")
        else:
            returns = data["Close"].pct_change().dropna()
            result = calculate_risk(returns, confidence)

            if result is None:
                st.error("Insufficient data to calculate risk.")
            else:
                var_amount = result["var"] * amount
                cvar_amount = result["cvar"] * amount

                c1, c2, c3 = st.columns(3)

                c1.metric(
                    f"Historical VaR ({confidence:.0%})",
                    money_inr(var_amount)
                )
                c2.metric(
                    f"Historical CVaR ({confidence:.0%})",
                    money_inr(cvar_amount)
                )
                c3.metric(
                    "Annualised Volatility",
                    f"{result['volatility']:.2%}"
                )

                st.caption(
                    f"Calculated from {result['observations']} daily returns. "
                    "VaR/CVaR are historical estimates, not maximum-loss "
                    "guarantees."
                )

                fig = go.Figure()
                fig.add_trace(go.Histogram(
                    x=returns * 100,
                    nbinsx=45,
                    name="Daily returns",
                    marker_color="#60a5fa"
                ))

                fig.update_layout(
                    title="Distribution of Daily Returns",
                    xaxis_title="Daily return (%)",
                    yaxis_title="Frequency",
                    template="plotly_dark",
                    paper_bgcolor="#10182a",
                    plot_bgcolor="#10182a",
                    height=390
                )

                st.plotly_chart(fig, use_container_width=True)


# =========================================================
# SIP CALCULATOR
# =========================================================

elif page == "SIP Calculator":

    st.markdown("## 🧮 Investment Calculator")
    st.write("Estimate the future value of a recurring SIP or lump-sum investment.")

    investment_type = st.radio(
        "Investment type",
        ["Monthly SIP", "Lump Sum"],
        horizontal=True
    )

    if investment_type == "Monthly SIP":
        monthly_amount = st.number_input(
            "Monthly investment (₹)",
            min_value=500,
            value=10000,
            step=500
        )

        annual_return = st.slider(
            "Assumed annual return (%)",
            min_value=1,
            max_value=20,
            value=12
        )

        years = st.slider(
            "Investment period (years)",
            min_value=1,
            max_value=40,
            value=10
        )

        months = years * 12
        monthly_rate = (1 + annual_return / 100) ** (1 / 12) - 1

        if monthly_rate == 0:
            future_value = monthly_amount * months
        else:
            future_value = (
                monthly_amount
                * (((1 + monthly_rate) ** months - 1) / monthly_rate)
                * (1 + monthly_rate)
            )

        invested = monthly_amount * months
        gains = future_value - invested

    else:
        lump_sum = st.number_input(
            "Initial investment (₹)",
            min_value=1000,
            value=100000,
            step=10000
        )

        annual_return = st.slider(
            "Assumed annual return (%)",
            min_value=1,
            max_value=20,
            value=12,
            key="lump_return"
        )

        years = st.slider(
            "Investment period (years)",
            min_value=1,
            max_value=40,
            value=10,
            key="lump_years"
        )

        future_value = lump_sum * (
            1 + annual_return / 100
        ) ** years

        invested = lump_sum
        gains = future_value - invested

    c1, c2, c3 = st.columns(3)

    c1.metric("Amount Invested", money_inr(invested))
    c2.metric("Estimated Value", money_inr(future_value))
    c3.metric("Estimated Gain", money_inr(gains))

    st.caption(
        "Illustrative projection only. Actual returns vary, are not guaranteed, "
        "and may be affected by expenses, taxes and market conditions."
    )

    chart = pd.DataFrame({
        "Category": ["Amount Invested", "Estimated Gain"],
        "Amount": [invested, max(gains, 0)]
    })

    fig = go.Figure(go.Bar(
        x=chart["Category"],
        y=chart["Amount"],
        marker_color=["#64748b", "#60a5fa"]
    ))

    fig.update_layout(
        title="Investment Value Breakdown",
        template="plotly_dark",
        paper_bgcolor="#10182a",
        plot_bgcolor="#10182a",
        yaxis_title="Amount (₹)",
        height=350
    )

    st.plotly_chart(fig, use_container_width=True)


# =========================================================
# AI ASSISTANT
# =========================================================

elif page == "AI Assistant":

    import os
    from dotenv import load_dotenv
    from google import genai

    load_dotenv(override=True)

    st.markdown("## 🤖 FinPilot AI Assistant")

    st.write(
        "A dedicated workspace for financial research, portfolio questions "
        "and risk-analysis explanations."
    )

    st.subheader("💬 Ask FinPilot AI")

    try:
        gemini_key = st.secrets.get("GEMINI_API_KEY", "")
    except Exception:
        gemini_key = ""

    if not gemini_key:
        gemini_key = os.getenv("GEMINI_API_KEY", "")

    if not gemini_key:
        st.error(
            "Gemini API key not found. "
            "Please add GEMINI_API_KEY to your .env file."
        )

    else:
        client = genai.Client(api_key=gemini_key)

        if "finpilot_messages" not in st.session_state:
            st.session_state.finpilot_messages = [
                {
                    "role": "assistant",
                    "content": (
                        "Hello! I'm FinPilot AI. Ask me about financial "
                        "concepts, portfolio risk, VaR, CVaR, diversification, "
                        "or investing. How can I help you today?"
                    ),
                }
            ]

        for message in st.session_state.finpilot_messages:
            with st.chat_message(message["role"]):
                st.write(message["content"])

        user_question = st.chat_input(
            "Ask your financial question..."
        )

        if user_question:
            st.session_state.finpilot_messages.append(
                {
                    "role": "user",
                    "content": user_question,
                }
            )

            with st.chat_message("user"):
                st.write(user_question)

            try:
                with st.chat_message("assistant"):
                    with st.spinner("FinPilot AI is thinking..."):

                        conversation = [
                            (
                                "User: " + message["content"]
                                if message["role"] == "user"
                                else "Assistant: " + message["content"]
                            )
                            for message in st.session_state.finpilot_messages
                        ]

                        response = client.models.generate_content(
                            model="gemini-3.8-flash",
                            contents="\n\n".join(conversation),
                            config={
                                "system_instruction": (
                                    "You are FinPilot AI, a financial research "
                                    "and education assistant. Explain financial "
                                    "concepts clearly, use structured answers "
                                    "when helpful, and distinguish facts from "
                                    "assumptions. Never guarantee investment "
                                    "returns. Do not claim to be a SEBI-registered "
                                    "investment adviser. Explain risks and "
                                    "limitations, and do not invent live market "
                                    "data. For current prices or financial "
                                    "figures, state when verification is needed."
                                ),
                                "max_output_tokens": 800,
                            },
                        )

                        answer = response.text

                        if not answer:
                            answer = (
                                "I couldn't generate a response. "
                                "Please try asking your question differently."
                            )

                        st.write(answer)

                st.session_state.finpilot_messages.append(
                    {
                        "role": "assistant",
                        "content": answer,
                    }
                )

            except Exception as error:
                st.error(
                    "The AI request failed. Please check your internet "
                    "connection, Gemini API key, API quota, and model availability."
                )
                st.caption(f"Technical details: {error}")

    if st.button("Clear Chat"):
        st.session_state.finpilot_messages = [
            {
                "role": "assistant",
                "content": (
                    "Hello! I'm FinPilot AI. Ask me about financial concepts, "
                    "portfolio risk, VaR, CVaR, diversification, or investing."
                ),
            }
        ]
        st.rerun()

    st.markdown("### Example questions")

    st.markdown("""
    - Explain the difference between VaR and CVaR.
    - What does annualised volatility tell an investor?
    - How does portfolio diversification work?
    - Explain the difference between SIP and lump-sum investing.
    """)

    st.warning(
        "This prototype is an educational analytics tool, not a source of "
        "guaranteed returns or personalised investment advice."
    )


# =========================================================
# FOOTER
# =========================================================

st.divider()

st.caption(
    "FinPilot AI | Financial Analytics Prototype | "
    "Market data availability may vary. "
    "Not investment advice."
)