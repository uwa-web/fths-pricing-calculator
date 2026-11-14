"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowLeftRight, ArrowUpRight, Calculator, Check,
  ChevronDown, CircleHelp, FileText, Info, RefreshCw, Sparkles, Wallet,
} from "lucide-react";

type Tab = "fees" | "reverse" | "hourly" | "project";
type CurrencyCode = "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "NGN";

const currencies: { code: CurrencyCode; name: string }[] = [
  { code: "USD", name: "US Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "EUR", name: "Euro" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "NGN", name: "Nigerian Naira" },
];

const currencySymbol = (code: CurrencyCode) =>
  new Intl.NumberFormat("en", { style: "currency", currency: code })
    .formatToParts(1).find((part) => part.type === "currency")?.value ?? code;

const money = (value: number, currency: CurrencyCode) =>
  new Intl.NumberFormat("en", {
    style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const nonNegative = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0);

function NumberField({
  label, value, onChange, currency, suffix, help, step = "0.01",
}: {
  label: string; value: number; onChange: (value: number) => void;
  currency?: CurrencyCode; suffix?: string; help?: string; step?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="number-control">
        {currency && <span className="field-prefix">{currencySymbol(currency)}</span>}
        <input
          type="number" min="0" step={step} value={value}
          onChange={(event) => onChange(nonNegative(Number(event.target.value)))}
        />
        {suffix && <span className="field-suffix">{suffix}</span>}
      </span>
      {help && <small className="field-help">{help}</small>}
    </label>
  );
}

function BreakdownRow({
  label, value, negative = false, bold = false,
}: { label: string; value: string; negative?: boolean; bold?: boolean }) {
  return (
    <div className={`breakdown-row${bold ? " breakdown-bold" : ""}`}>
      <span>{label}</span>
      <strong className={negative ? "deduction" : ""}>{negative ? "−" : ""}{value}</strong>
    </div>
  );
}

const learningItems = [
  {
    number: "01",
    title: "Freelancer service fee",
    description: "Upwork deducts a freelancer service fee from your earnings. The rate can range from 0% to 15% depending on the contract. Your exact rate is shown before you submit a proposal or accept an offer, and is fixed once the contract begins.",
    link: "https://support.upwork.com/hc/en-us/articles/211062538-Learn-about-the-Freelancer-Service-Fee",
    linkLabel: "Read Upwork's service fee guide",
  },
  {
    number: "02",
    title: "Nigeria VAT on the service fee",
    description: "Upwork says Nigeria's 7.5% VAT applies to services it provides, including the Freelancer Service Fee. In this calculator, VAT is calculated on the service fee amount, not on the entire contract value. Your tax treatment may differ if your tax residence is elsewhere.",
    link: "https://support.upwork.com/hc/en-us/articles/15156139408147-How-VAT-works-for-freelancers-in-Nigeria",
    linkLabel: "Read Upwork's Nigeria VAT guide",
  },
  {
    number: "03",
    title: "Withdrawal fee",
    description: "A withdrawal fee may be charged when you transfer your available Upwork earnings. The amount depends on the withdrawal method and may change. The $2.99 starting value is based on the transaction screenshot supplied for this tool, not a universal Upwork fee. Check your own withdrawal method and transaction details.",
    link: "https://support.upwork.com/hc/en-us/articles/211060918-How-to-get-paid-on-Upwork",
    linkLabel: "Read Upwork's payment and withdrawal guide",
  },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("fees");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
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
  const [pdfBusy, setPdfBusy] = useState(false);

  const setSelectedCurrency = (next: CurrencyCode) => {
    setCurrency(next);
    // The $2.99 value is based on the user's USD statement. Never silently
    // treat that USD amount as another currency's withdrawal fee.
    setWithdrawal(next === "USD" ? 2.99 : 0);
  };

  const fees = useMemo(() => {
    const service = round2(contract * serviceRate / 100);
    const vat = round2(service * vatRate / 100);
    const beforeWithdrawal = round2(contract - service - vat);
    const net = round2(beforeWithdrawal - withdrawal);
    return {
      service, vat, beforeWithdrawal, net,
      deductions: round2(service + vat + withdrawal),
    };
  }, [contract, serviceRate, vatRate, withdrawal]);

  const reverse = useMemo(() => {
    const retainedRate = 1 - (serviceRate / 100) * (1 + vatRate / 100);
    const quote = retainedRate > 0 ? round2((desiredNet + withdrawal) / retainedRate) : 0;
    const service = round2(quote * serviceRate / 100);
    const vat = round2(service * vatRate / 100);
    return { quote, service, vat, net: round2(quote - service - vat - withdrawal) };
  }, [desiredNet, serviceRate, vatRate, withdrawal]);

  const hourly = useMemo(() => {
    const totalHours = workDays * hoursPerDay;
    const billableHours = totalHours * billablePercent / 100;
    return { totalHours, billableHours, rate: billableHours > 0 ? monthlyGoal / billableHours : 0 };
  }, [monthlyGoal, workDays, hoursPerDay, billablePercent]);

  const project = useMemo(() => {
    const base = hourly.rate * projectHours;
    return {
      base: round2(base),
      bufferAmount: round2(base * buffer / 100),
      quote: round2(base * (1 + buffer / 100)),
    };
  }, [hourly.rate, projectHours, buffer]);

  const reset = () => {
    setTab("fees"); setCurrency("USD"); setContract(100); setServiceRate(15);
    setVatRate(7.5); setWithdrawal(2.99); setDesiredNet(500); setMonthlyGoal(3000);
    setWorkDays(20); setHoursPerDay(8); setBillablePercent(60);
    setProjectHours(20); setBuffer(15); setShowSettings(false);
  };

  const getSummary = () => {
    const lines: [string, string][] = [];
    if (tab === "fees") {
      lines.push(
        ["Client contract amount", money(contract, currency)],
        [`Freelancer service fee (${serviceRate}%)`, `-${money(fees.service, currency)}`],
        [`Nigeria VAT on service fee (${vatRate}%)`, `-${money(fees.vat, currency)}`],
        ["Earnings before withdrawal", money(fees.beforeWithdrawal, currency)],
        ["Withdrawal fee", `-${money(withdrawal, currency)}`],
        ["Estimated amount received", money(fees.net, currency)],
      );
    } else if (tab === "reverse") {
      lines.push(
        ["Desired take-home", money(desiredNet, currency)],
        ["Recommended contract quote", money(reverse.quote, currency)],
        [`Freelancer service fee (${serviceRate}%)`, `-${money(reverse.service, currency)}`],
        [`Nigeria VAT (${vatRate}%)`, `-${money(reverse.vat, currency)}`],
        ["Withdrawal fee", `-${money(withdrawal, currency)}`],
        ["Estimated amount received", money(reverse.net, currency)],
      );
    } else if (tab === "hourly") {
      lines.push(
        ["Monthly income target", money(monthlyGoal, currency)],
        ["Total working hours", `${hourly.totalHours.toFixed(1)} hours`],
        ["Billable hours", `${hourly.billableHours.toFixed(1)} hours`],
        ["Recommended hourly rate", `${money(hourly.rate, currency)} / hour`],
      );
    } else {
      lines.push(
        ["Target hourly rate", `${money(hourly.rate, currency)} / hour`],
        ["Estimated project hours", `${projectHours} hours`],
        ["Base project price", money(project.base, currency)],
        [`Pricing buffer (${buffer}%)`, money(project.bufferAmount, currency)],
        ["Suggested project quote", money(project.quote, currency)],
      );
    }
    return lines;
  };

  const copySummary = async () => {
    const text = `FTHS Upwork Pricing Calculator\nCurrency: ${currency}\n${getSummary().map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nEstimate only. Verify your actual fees in Upwork.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  };

  const exportPdf = async () => {
    setPdfBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const left = 18;
      let y = 22;
      pdf.setFillColor(75, 38, 15);
      pdf.rect(0, 0, pageWidth, 42, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("FIRST TECH HUB SOLUTIONS", left, 16);
      pdf.setFontSize(19);
      pdf.text("Upwork pricing summary", left, 29);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(`Generated ${new Date().toLocaleDateString()}  |  Currency: ${currency}`, left, 36);
      y = 57;
      pdf.setTextColor(59, 29, 9);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      const headline = tab === "fees" ? "Fee calculation" : tab === "reverse" ? "Reverse pricing" : tab === "hourly" ? "Hourly rate estimate" : "Project price estimate";
      pdf.text(headline, left, y);
      y += 12;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      for (const [label, value] of getSummary()) {
        pdf.setTextColor(101, 83, 68);
        pdf.text(label, left, y);
        pdf.setTextColor(59, 29, 9);
        pdf.text(value, pageWidth - left, y, { align: "right" });
        pdf.setDrawColor(232, 222, 210);
        pdf.line(left, y + 3, pageWidth - left, y + 3);
        y += 11;
      }
      y += 8;
      pdf.setFillColor(246, 243, 236);
      pdf.roundedRect(left, y, pageWidth - left * 2, 29, 3, 3, "F");
      pdf.setTextColor(75, 38, 15);
      pdf.setFont("helvetica", "bold");
      pdf.text("Important", left + 5, y + 8);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const disclaimer = "This is an estimate, not a guarantee of your Upwork payout or tax liability. Service fees, VAT and withdrawal fees can vary. Confirm the amounts shown in your Upwork account before quoting or withdrawing.";
      pdf.text(pdf.splitTextToSize(disclaimer, pageWidth - left * 2 - 10), left + 5, y + 14);
      y += 39;
      pdf.setTextColor(105, 86, 70);
      pdf.setFontSize(8);
      pdf.text("Official references:", left, y);
      y += 6;
      pdf.text("support.upwork.com — Freelancer Service Fee, Nigeria VAT and withdrawal methods", left, y);
      pdf.save(`FTHS-Upwork-Pricing-${currency}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof Calculator }[] = [
    { id: "fees", label: "Fee calculator", icon: Wallet },
    { id: "reverse", label: "Reverse pricing", icon: ArrowLeftRight },
    { id: "hourly", label: "Hourly rate", icon: Calculator },
    { id: "project", label: "Project pricing", icon: Sparkles },
  ];

  return (
    <main className="site-shell">
      <div className="announcement">
        <span>Free tools for smarter freelancing.</span>
        <a href="https://www.firsttechhubsolutions.com/" target="_blank" rel="noreferrer">Explore FTHS <ArrowUpRight size={13} /></a>
      </div>

      <header className="site-header">
        <a className="brand" href="https://www.firsttechhubsolutions.com/" aria-label="First Tech Hub Solutions home">
          <Image src="/logo/fths-mark.png" alt="FTHS logo" width={52} height={60} priority />
          <span>First Tech Hub Solutions</span>
        </a>
        <nav className="header-nav" aria-label="Main navigation">
          <a href="https://www.firsttechhubsolutions.com/#courses">Courses</a>
          <a href="https://www.firsttechhubsolutions.com/blog/">Blog</a>
          <a href="https://www.firsttechhubsolutions.com/#contact">Contact</a>
        </nav>
        <a className="header-cta" href="https://www.firsttechhubsolutions.com/" target="_blank" rel="noreferrer">Visit FTHS <ArrowUpRight size={15} /></a>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow"><i /> FREE FREELANCER TOOL</span>
            <h1>Price your work.<br /><em>Know your numbers.</em></h1>
            <p>Understand your Upwork fees, calculate your take-home earnings and price your services with confidence.</p>
            <div className="hero-meta"><span><Check size={15} /> Free to use</span><span><Check size={15} /> No sign-up required</span><span><Check size={15} /> PDF export</span></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="floating-card">
              <span className="floating-label">YOUR NEXT PROJECT</span>
              <strong>{money(1000, currency)}</strong>
              <div className="floating-rule" />
              <span className="floating-caption">Quote with clarity. Earn with confidence.</span>
              <div className="floating-chip"><Sparkles size={14} /> Smart pricing starts here</div>
            </div>
          </div>
        </div>
      </section>

      <section className="calculator-section" id="calculator">
        <div className="section-intro">
          <div><span className="eyebrow eyebrow-brown">THE CALCULATOR</span><h2>Make every number count.</h2><p>Choose what you want to calculate, enter your figures and get a clear breakdown.</p></div>
          <button className="reset-button" onClick={reset}><RefreshCw size={14} /> Reset</button>
        </div>

        <div className="calculator-card">
          <div className="calculator-toolbar">
            <div className="tabs" role="tablist" aria-label="Calculator type">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "tab active" : "tab"} onClick={() => setTab(id)}>
                  <Icon size={16} /><span>{label}</span>
                </button>
              ))}
            </div>
            <label className="currency-picker">
              <span>Currency</span>
              <select value={currency} onChange={(event) => setSelectedCurrency(event.target.value as CurrencyCode)}>
                {currencies.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}
              </select>
              <ChevronDown size={15} />
            </label>
          </div>

          <div className="calculator-grid">
            <div className="input-panel">
              {tab === "fees" && <>
                <div className="panel-heading"><span className="step-label">01 / CONTRACT</span><h3>Start with your contract amount.</h3><p>Enter the amount your client is paying you before deductions.</p></div>
                <NumberField label="Contract amount" value={contract} onChange={setContract} currency={currency} />
                <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)}><span><ChevronDown className={showSettings ? "rotated" : ""} size={16} /> Fee assumptions</span><b>{showSettings ? "Close settings" : "Edit fee rates"}</b></button>
                {showSettings && <div className="settings-panel">
                  <NumberField label="Freelancer service fee" value={serviceRate} onChange={setServiceRate} suffix="%" step="0.1" help="Upwork's current fee range is 0%–15%. Enter the rate shown on your contract." />
                  <NumberField label="Nigeria VAT on service fee" value={vatRate} onChange={setVatRate} suffix="%" step="0.1" help="Default 7.5%. Applies to Nigerian tax residents; change it to match your situation." />
                  <NumberField label="Withdrawal fee" value={withdrawal} onChange={setWithdrawal} currency={currency} help={currency === "USD" ? "Default $2.99, based on the transaction screenshot supplied. Check your actual withdrawal method." : "Enter the withdrawal fee in the selected currency. The USD $2.99 default is not converted."} />
                </div>}
              </>}

              {tab === "reverse" && <>
                <div className="panel-heading"><span className="step-label">01 / TAKE-HOME TARGET</span><h3>Work backwards from your goal.</h3><p>Tell us what you want to receive after the estimated deductions.</p></div>
                <NumberField label="Desired amount to receive" value={desiredNet} onChange={setDesiredNet} currency={currency} />
                <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)}><span><ChevronDown className={showSettings ? "rotated" : ""} size={16} /> Fee assumptions</span><b>{showSettings ? "Close settings" : "Edit fee rates"}</b></button>
                {showSettings && <div className="settings-panel">
                  <NumberField label="Freelancer service fee" value={serviceRate} onChange={setServiceRate} suffix="%" step="0.1" />
                  <NumberField label="Nigeria VAT on service fee" value={vatRate} onChange={setVatRate} suffix="%" step="0.1" />
                  <NumberField label="Withdrawal fee" value={withdrawal} onChange={setWithdrawal} currency={currency} />
                </div>}
              </>}

              {(tab === "hourly" || tab === "project") && <>
                <div className="panel-heading"><span className="step-label">01 / INCOME TARGET</span><h3>Build your rate around your goals.</h3><p>Set a realistic monthly income target and the time you can actually bill.</p></div>
                <NumberField label="Desired monthly income" value={monthlyGoal} onChange={setMonthlyGoal} currency={currency} />
                <div className="field-grid">
                  <NumberField label="Working days / month" value={workDays} onChange={setWorkDays} step="1" />
                  <NumberField label="Hours / working day" value={hoursPerDay} onChange={setHoursPerDay} step="1" />
                </div>
                <NumberField label="Billable time" value={billablePercent} onChange={setBillablePercent} suffix="%" step="1" help="The percentage of your working time you can invoice to clients. Excludes admin, marketing and breaks." />
                {tab === "project" && <div className="project-extra">
                  <span className="step-label">02 / PROJECT SCOPE</span>
                  <NumberField label="Estimated project hours" value={projectHours} onChange={setProjectHours} step="1" />
                  <NumberField label="Pricing buffer" value={buffer} onChange={setBuffer} suffix="%" step="1" help="Allow for revisions, uncertainty and work that takes longer than expected." />
                </div>}
              </>}

              <div className="local-note"><Info size={15} /> Your figures stay in this browser. We don't store your calculations.</div>
            </div>

            <div className="result-panel">
              <div className="result-heading"><div><span className="step-label">YOUR ESTIMATE</span><h3>{tab === "fees" ? "Here's what you keep." : tab === "reverse" ? "Here's what to quote." : tab === "hourly" ? "Your target hourly rate." : "Your suggested project price."}</h3></div><span className="result-symbol"><Wallet size={19} /></span></div>
              {tab === "fees" && <>
                <div className="hero-result">{money(fees.net, currency)}<span>Estimated amount received</span></div>
                <div className="result-breakdown">
                  <BreakdownRow label="Client contract amount" value={money(contract, currency)} />
                  <BreakdownRow label={`Service fee (${serviceRate}%)`} value={money(fees.service, currency)} negative />
                  <BreakdownRow label={`Nigeria VAT (${vatRate}% of service fee)`} value={money(fees.vat, currency)} negative />
                  <BreakdownRow label="Earnings before withdrawal" value={money(fees.beforeWithdrawal, currency)} />
                  <BreakdownRow label="Withdrawal fee" value={money(withdrawal, currency)} negative />
                  <BreakdownRow label="Total deductions" value={money(fees.deductions, currency)} negative bold />
                </div>
                <div className="takehome-strip"><span>Estimated payout</span><strong>{money(fees.net, currency)}</strong></div>
                {fees.net < 0 && <p className="inline-warning">Your deductions exceed the contract amount. Review your inputs.</p>}
              </>}

              {tab === "reverse" && <>
                <div className="hero-result">{money(reverse.quote, currency)}<span>Recommended contract quote</span></div>
                <div className="result-breakdown">
                  <BreakdownRow label="Desired take-home" value={money(desiredNet, currency)} />
                  <BreakdownRow label={`Service fee (${serviceRate}%)`} value={money(reverse.service, currency)} negative />
                  <BreakdownRow label={`Nigeria VAT (${vatRate}%)`} value={money(reverse.vat, currency)} negative />
                  <BreakdownRow label="Withdrawal fee" value={money(withdrawal, currency)} negative />
                </div>
                <div className="takehome-strip"><span>Estimated amount received</span><strong>{money(reverse.net, currency)}</strong></div>
              </>}

              {tab === "hourly" && <>
                <div className="hero-result">{money(hourly.rate, currency)}<span>Recommended hourly rate</span></div>
                <div className="result-breakdown">
                  <BreakdownRow label="Monthly income target" value={money(monthlyGoal, currency)} />
                  <BreakdownRow label="Total working hours" value={`${hourly.totalHours.toFixed(1)} hrs`} />
                  <BreakdownRow label="Billable hours" value={`${hourly.billableHours.toFixed(1)} hrs`} />
                  <BreakdownRow label="Billable capacity" value={`${billablePercent}%`} />
                </div>
                <div className="takehome-strip"><span>Weekly revenue target</span><strong>{money(monthlyGoal / 4, currency)}</strong></div>
                <p className="result-footnote">This is a gross billing target before platform fees, taxes and business expenses.</p>
              </>}

              {tab === "project" && <>
                <div className="hero-result">{money(project.quote, currency)}<span>Suggested project quote</span></div>
                <div className="result-breakdown">
                  <BreakdownRow label="Target hourly rate" value={`${money(hourly.rate, currency)} / hr`} />
                  <BreakdownRow label="Estimated project hours" value={`${projectHours} hrs`} />
                  <BreakdownRow label="Base project price" value={money(project.base, currency)} />
                  <BreakdownRow label={`Pricing buffer (${buffer}%)`} value={money(project.bufferAmount, currency)} />
                </div>
                <div className="takehome-strip"><span>Suggested client quote</span><strong>{money(project.quote, currency)}</strong></div>
                <p className="result-footnote">This is a gross project quote. Use Fee Calculator to estimate platform deductions.</p>
              </>}

              <div className="result-actions">
                <button className="primary-button" onClick={exportPdf} disabled={pdfBusy}><FileText size={16} /> {pdfBusy ? "Preparing PDF..." : "Export PDF"}</button>
                <button className="secondary-button" onClick={copySummary}>{copied ? <Check size={16} /> : <ArrowDownToLine size={16} />}{copied ? "Copied" : "Copy summary"}</button>
              </div>
            </div>
          </div>
          <div className="currency-disclaimer"><Info size={14} /> Currency selection changes the calculation's currency format; it does not perform live foreign-exchange conversion. Enter all amounts, including the withdrawal fee, in the selected currency.</div>
        </div>
      </section>

      <section className="learning-section">
        <div className="learning-intro"><span className="eyebrow eyebrow-brown">KNOW WHAT YOU'RE PAYING</span><h2>Understand every deduction.</h2><p>Pricing well starts with understanding where your money goes. Here are the charges in this calculator and where to verify them.</p></div>
        <div className="learning-grid">
          {learningItems.map((item) => (
            <article className="learning-card" key={item.number}>
              <span className="learning-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.link} target="_blank" rel="noreferrer">{item.linkLabel} <ArrowUpRight size={14} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="bottom-cta">
        <div><span className="eyebrow">BUILD YOUR FREELANCE CAREER</span><h2>Better pricing is a business skill.</h2><p>Learn how to build a stronger Upwork profile, write better proposals and grow your freelance business.</p></div>
        <a href="https://www.firsttechhubsolutions.com/" target="_blank" rel="noreferrer">Explore FTHS courses <ArrowUpRight size={16} /></a>
      </section>

      <footer className="site-footer">
        <a className="footer-brand" href="https://www.firsttechhubsolutions.com/">
          <Image src="/logo/fths-mark.png" alt="" width={38} height={44} />
          <span>First Tech Hub Solutions</span>
        </a>
        <p>Practical digital skills for freelancing, remote work and the modern workplace.</p>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} First Tech Hub Solutions.</span><span>Free tool · No account required</span></div>
      </footer>
    </main>
  );
}
