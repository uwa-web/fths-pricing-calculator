"use client";

import Image from "next/image";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowLeftRight, Calculator, Check, ChevronDown,
  CircleHelp, ExternalLink, Info, RefreshCw, Sparkles, Wallet,
} from "lucide-react";

type Tab = "fees" | "reverse" | "hourly" | "project";
const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number.isFinite(n) ? n : 0);
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const clampNonNegative = (n: number) => Math.max(0, Number.isFinite(n) ? n : 0);

function Field({
  label, value, onChange, suffix, help, min = 0, step = "0.01",
}: {
  label: string; value: number; onChange: (v: number) => void;
  suffix?: string; help?: string; min?: number; step?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        {suffix === "$" && <span className="input-prefix">$</span>}
        <input type="number" min={min} step={step} value={value}
          onChange={(e) => onChange(clampNonNegative(Number(e.target.value)))} />
        {suffix && suffix !== "$" && <span className="input-suffix">{suffix}</span>}
      </span>
      {help && <small>{help}</small>}
    </label>
  );
}

function ResultRow({ label, value, negative = false, strong = false }: {
  label: string; value: string; negative?: boolean; strong?: boolean;
}) {
  return <div className={`result-row ${strong ? "strong" : ""}`}>
    <span>{label}</span><span className={negative ? "negative" : ""}>{negative ? "−" : ""}{value}</span>
  </div>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("fees");
  const [contract, setContract] = useState(100);
  const [serviceRate, setServiceRate] = useState(15);
  const [vatRate, setVatRate] = useState(7.5);
  const [withdrawal, setWithdrawal] = useState(2.99);
  const [desiredNet, setDesiredNet] = useState(500);
  const [monthlyGoal, setMonthlyGoal] = useState(3000);
  const [workDays, setWorkDays] = useState(20);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [billablePercent, setBillablePercent] = useState(60);
  const [projectHours, setProjectHours] = useState(20);
  const [buffer, setBuffer] = useState(15);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fees are rounded to cents at each line item, matching a displayed statement breakdown.
  const breakdown = useMemo(() => {
    const fee = round2(contract * serviceRate / 100);
    const vat = round2(fee * vatRate / 100);
    const netBeforeWithdrawal = round2(contract - fee - vat);
    const net = round2(netBeforeWithdrawal - withdrawal);
    return { fee, vat, netBeforeWithdrawal, net, totalDeductions: round2(fee + vat + withdrawal) };
  }, [contract, serviceRate, vatRate, withdrawal]);

  const reverse = useMemo(() => {
    // Net = quote * (1 - service rate - VAT-on-service-fee rate) - fixed withdrawal.
    const effectiveRate = 1 - (serviceRate / 100) * (1 + vatRate / 100);
    const quote = effectiveRate > 0 ? (desiredNet + withdrawal) / effectiveRate : 0;
    const roundedQuote = round2(quote);
    const fee = round2(roundedQuote * serviceRate / 100);
    const vat = round2(fee * vatRate / 100);
    return { quote: roundedQuote, fee, vat, net: round2(roundedQuote - fee - vat - withdrawal) };
  }, [desiredNet, serviceRate, vatRate, withdrawal]);

  const hourly = useMemo(() => {
    const hours = workDays * hoursPerDay * billablePercent / 100;
    const rate = hours > 0 ? monthlyGoal / hours : 0;
    return { hours, rate };
  }, [monthlyGoal, workDays, hoursPerDay, billablePercent]);

  const project = useMemo(() => {
    const base = hourly.rate * projectHours;
    return { base: round2(base), bufferAmount: round2(base * buffer / 100), quote: round2(base * (1 + buffer / 100)) };
  }, [hourly.rate, projectHours, buffer]);

  const reset = () => {
    setContract(100); setServiceRate(15); setVatRate(7.5); setWithdrawal(2.99);
    setDesiredNet(500); setMonthlyGoal(3000); setWorkDays(20); setHoursPerDay(8);
    setBillablePercent(60); setProjectHours(20); setBuffer(15); setShowSettings(false);
  };

  const copySummary = async () => {
    const summary = tab === "fees"
      ? `Upwork quote: ${money(contract)}\nService fee (${serviceRate}%): ${money(breakdown.fee)}\nNigeria VAT on service fee (${vatRate}%): ${money(breakdown.vat)}\nNet before withdrawal: ${money(breakdown.netBeforeWithdrawal)}\nWithdrawal fee: ${money(withdrawal)}\nEstimated amount received: ${money(breakdown.net)}`
      : tab === "reverse"
      ? `Desired take-home: ${money(desiredNet)}\nRecommended quote: ${money(reverse.quote)}\nEstimated amount received: ${money(reverse.net)}`
      : tab === "hourly"
      ? `Monthly income goal: ${money(monthlyGoal)}\nBillable hours: ${hourly.hours.toFixed(1)}\nRecommended hourly rate: ${money(hourly.rate)}`
      : `Recommended hourly rate: ${money(hourly.rate)}\nProject hours: ${projectHours}\nBase project price: ${money(project.base)}\nBuffer: ${money(project.bufferAmount)}\nSuggested project quote: ${money(project.quote)}`;
    try { await navigator.clipboard.writeText(summary); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };

  const tabs: { id: Tab; label: string; icon: typeof Calculator }[] = [
    { id: "fees", label: "Fee calculator", icon: Wallet },
    { id: "reverse", label: "Reverse pricing", icon: ArrowLeftRight },
    { id: "hourly", label: "Hourly rate", icon: Calculator },
    { id: "project", label: "Project pricing", icon: Sparkles },
  ];

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="First Tech Hub Solutions home">
          <img className="brand-logo" src="/fths-logo.png" alt="First Tech Hub Solutions" />
        </a>
        <a className="top-link" href="https://www.firsttechhubsolutions.com/" target="_blank" rel="noreferrer">
          Visit FTHS <ExternalLink size={14} />
        </a>
      </header>

      <section className="hero">
        <div className="eyebrow"><span className="live-dot" /> FREE FREELANCER TOOL</div>
        <h1>Price your work.<br /><em>Know your numbers.</em></h1>
        <p>Calculate Upwork fees, estimate your take-home earnings and set rates that support your income goals.</p>
        <div className="hero-note"><Info size={15} /> No account. No subscription. Just useful numbers.</div>
      </section>

      <section className="calculator-shell">
        <div className="section-heading">
          <div><span className="eyebrow muted">THE CALCULATOR</span><h2>What do you want to calculate?</h2></div>
          <button className="reset-button" onClick={reset}><RefreshCw size={14} /> Reset</button>
        </div>

        <div className="tabs" role="tablist" aria-label="Calculator type">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "tab active" : "tab"} onClick={() => setTab(id)}>
              <Icon size={16} /><span>{label}</span>
            </button>
          ))}
        </div>

        <div className="calculator-grid">
          <div className="input-panel">
            {tab === "fees" && <>
              <div className="panel-title"><h3>Contract details</h3><p>Enter the amount your client will pay on Upwork.</p></div>
              <Field label="Contract amount" value={contract} onChange={setContract} suffix="$" />
              <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)}>
                <span><ChevronDown size={16} className={showSettings ? "rotate" : ""} /> Fee assumptions</span><small>{showSettings ? "Hide" : "Edit rates"}</small>
              </button>
              {showSettings && <div className="settings-box">
                <Field label="Upwork service fee" value={serviceRate} onChange={setServiceRate} suffix="%" step="0.1" help="Default: 15%. Your actual contract fee may differ." />
                <Field label="Nigeria VAT on service fee" value={vatRate} onChange={setVatRate} suffix="%" step="0.1" help="Applied to the service fee, not the full contract." />
                <Field label="Withdrawal fee" value={withdrawal} onChange={setWithdrawal} suffix="$" help="Default shown in your uploaded Upwork statement." />
              </div>}
            </>}

            {tab === "reverse" && <>
              <div className="panel-title"><h3>Set your take-home target</h3><p>Work backwards to find the contract amount you should quote.</p></div>
              <Field label="How much do you want to receive?" value={desiredNet} onChange={setDesiredNet} suffix="$" />
              <div className="assumption-note"><Info size={15} /> Uses your current fee assumptions. <button onClick={() => setShowSettings(!showSettings)}> {showSettings ? "Hide" : "Edit fees"}</button></div>
              {showSettings && <div className="settings-box">
                <Field label="Upwork service fee" value={serviceRate} onChange={setServiceRate} suffix="%" step="0.1" />
                <Field label="Nigeria VAT on service fee" value={vatRate} onChange={setVatRate} suffix="%" step="0.1" />
                <Field label="Withdrawal fee" value={withdrawal} onChange={setWithdrawal} suffix="$" />
              </div>}
            </>}

            {(tab === "hourly" || tab === "project") && <>
              <div className="panel-title"><h3>{tab === "hourly" ? "Your income goal" : "Project estimate"}</h3><p>{tab === "hourly" ? "Set a monthly target and realistic working capacity." : "Estimate a project quote from your target hourly rate."}</p></div>
              <Field label="Desired monthly income" value={monthlyGoal} onChange={setMonthlyGoal} suffix="$" />
              <div className="two-fields">
                <Field label="Working days / month" value={workDays} onChange={setWorkDays} step="1" />
                <Field label="Hours / working day" value={hoursPerDay} onChange={setHoursPerDay} step="1" />
              </div>
              <Field label="Billable time" value={billablePercent} onChange={setBillablePercent} suffix="%" step="1" help="Time available for paid client work, excluding admin, marketing and breaks." />
              {tab === "project" && <>
                <div className="divider-line" />
                <Field label="Estimated project hours" value={projectHours} onChange={setProjectHours} step="1" />
                <Field label="Pricing buffer" value={buffer} onChange={setBuffer} suffix="%" step="1" help="A contingency for revisions, scope uncertainty and overruns." />
              </>}
            </>}
            <div className="privacy-note"><Check size={14} /> Your calculations happen in this browser. We don't store your figures.</div>
          </div>

          <div className="results-panel">
            <div className="result-topline"><span>YOUR ESTIMATE</span><span className="result-icon"><Wallet size={17} /></span></div>
            {tab === "fees" && <>
              <div className="big-result">{money(breakdown.net)}<small>Estimated amount received</small></div>
              <div className="breakdown">
                <ResultRow label="Client contract amount" value={money(contract)} />
                <ResultRow label={`Upwork service fee (${serviceRate}%)`} value={money(breakdown.fee)} negative />
                <ResultRow label={`Nigeria VAT (${vatRate}% of service fee)`} value={money(breakdown.vat)} negative />
                <ResultRow label="Net before withdrawal" value={money(breakdown.netBeforeWithdrawal)} />
                <ResultRow label="Withdrawal fee" value={money(withdrawal)} negative />
                <ResultRow label="Total deductions" value={money(breakdown.totalDeductions)} negative strong />
              </div>
              <div className="net-callout"><span>Estimated payout</span><b>{money(breakdown.net)}</b></div>
              {breakdown.net < 0 && <p className="warning">Your deductions exceed the contract amount. Review the quote and fee settings.</p>}
            </>}

            {tab === "reverse" && <>
              <div className="big-result">{money(reverse.quote)}<small>Recommended contract quote</small></div>
              <div className="breakdown">
                <ResultRow label="Your desired take-home" value={money(desiredNet)} />
                <ResultRow label={`Upwork service fee (${serviceRate}%)`} value={money(reverse.fee)} negative />
                <ResultRow label={`Nigeria VAT (${vatRate}%)`} value={money(reverse.vat)} negative />
                <ResultRow label="Withdrawal fee" value={money(withdrawal)} negative />
              </div>
              <div className="net-callout"><span>Estimated amount received</span><b>{money(reverse.net)}</b></div>
            </>}

            {tab === "hourly" && <>
              <div className="big-result">{money(hourly.rate)}<small>Recommended hourly rate</small></div>
              <div className="breakdown">
                <ResultRow label="Monthly income target" value={money(monthlyGoal)} />
                <ResultRow label="Available working hours" value={`${(workDays * hoursPerDay).toFixed(1)} hrs`} />
                <ResultRow label="Billable hours" value={`${hourly.hours.toFixed(1)} hrs`} />
                <ResultRow label="Working days" value={`${workDays}`} />
              </div>
              <div className="net-callout"><span>Weekly revenue target (4 weeks)</span><b>{money(monthlyGoal / 4)}</b></div>
              <p className="fine-print">This is a gross billing target before Upwork fees, taxes and business expenses. Add those costs to your monthly goal if you want them covered.</p>
            </>}

            {tab === "project" && <>
              <div className="big-result">{money(project.quote)}<small>Suggested project quote</small></div>
              <div className="breakdown">
                <ResultRow label="Target hourly rate" value={money(hourly.rate)} />
                <ResultRow label="Estimated project hours" value={`${projectHours} hrs`} />
                <ResultRow label="Base project price" value={money(project.base)} />
                <ResultRow label={`Pricing buffer (${buffer}%)`} value={money(project.bufferAmount)} />
              </div>
              <div className="net-callout"><span>Suggested client quote</span><b>{money(project.quote)}</b></div>
              <p className="fine-print">This is a suggested gross project price. Use the Fee Calculator to estimate deductions and take-home earnings.</p>
            </>}

            <button className="copy-button" onClick={copySummary}>
              {copied ? <Check size={16} /> : <ArrowDownToLine size={16} />}
              {copied ? "Copied summary" : "Copy calculation"}
            </button>
          </div>
        </div>
      </section>

      <section className="explain-section">
        <div className="explain-heading"><span className="eyebrow muted">UNDERSTAND YOUR PAYOUT</span><h2>What gets deducted?</h2><p>These are separate charges. The calculator shows each one so you can plan your pricing with fewer surprises.</p></div>
        <div className="explain-cards">
          <article><span className="card-number">01</span><h3>Service fee</h3><p>Upwork charges a freelancer service fee on earnings. The rate can vary by contract, so check the rate displayed in your own contract.</p></article>
          <article><span className="card-number">02</span><h3>Nigeria VAT</h3><p>For this calculator, VAT is applied to the Upwork service fee using the 7.5% rate shown in your uploaded statement. Confirm the amount on your transaction.</p></article>
          <article><span className="card-number">03</span><h3>Withdrawal fee</h3><p>Your withdrawal method may carry a fee. We use $2.99 as the starting assumption based on your screenshot. Edit it when your actual fee differs.</p></article>
        </div>
      </section>

      <section className="disclaimer">
        <CircleHelp size={18} />
        <div><b>Important</b><p>This tool provides estimates, not financial, tax or legal advice. Upwork fees, VAT treatment, withdrawal charges and exchange rates may change or vary by account, contract and payment method. Always verify the charges shown in your Upwork account before sending a proposal or withdrawing funds.</p>
          <a href="https://support.upwork.com/" target="_blank" rel="noreferrer">Visit Upwork Help <ExternalLink size={12} /></a>
        </div>
      </section>

      <footer><div className="footer-brand">FIRST TECH HUB SOLUTIONS</div><p>Helping freelancers build practical digital skills and better businesses.</p><span>© {new Date().getFullYear()} First Tech Hub Solutions. Free to use.</span></footer>
    </main>
  );
}
