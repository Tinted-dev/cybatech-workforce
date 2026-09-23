import { Link } from "react-router-dom"

function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-semibold">Cybatech Workforce</span>
          <Link
            to="/login"
            className="text-sm bg-white text-slate-900 rounded px-4 py-2 font-medium"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Know who's on-site, in real time.
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Cybatech Workforce replaces paper sign-in sheets and WhatsApp check-ins
          with GPS-verified clock-in and clock-out, built for businesses with
          staff across multiple locations.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-slate-800 text-white rounded px-6 py-3 font-medium"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-white text-slate-800 border border-slate-300 rounded px-6 py-3 font-medium"
          >
            Log In
          </Link>
        </div>
      </section>

      {/* Demo placeholder */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-lg shadow-sm p-4 aspect-video flex items-center justify-center border border-slate-200">
          <p className="text-slate-400 text-sm">Demo video coming soon</p>
        </div>
      </section>

      {/* Problem / who it's for */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-slate-800 mb-3 text-center">
            Built for SMEs with staff on the move
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-center">
            Hotels, retail chains, field teams — if your staff work across more
            than one location, tracking attendance with spreadsheets or paper
            gets messy fast. Cybatech Workforce gives you one clear view of
            who's working, where, and when.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">
              GPS-verified clock-in
            </h3>
            <p className="text-sm text-slate-600">
              Employees clock in from their phone. We capture their real
              location and confirm they're actually on-site.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">
              Multi-location, built in
            </h3>
            <p className="text-sm text-slate-600">
              Manage every branch, office, or site from one dashboard, each
              with its own allowed check-in radius.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">
              Reports in one click
            </h3>
            <p className="text-sm text-slate-600">
              Filter attendance by date, employee, or location, and export to
              CSV for payroll in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white py-16">
        <div className="max-w-md mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Simple pricing
          </h2>
          <p className="text-slate-600 mb-6">
            One flat rate per employee. No setup fees, no surprises.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
            <p className="text-4xl font-bold text-slate-800 mb-1">
              KES 100
              <span className="text-base font-normal text-slate-500">
                {" "}/ employee / month
              </span>
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Unlimited locations and admins included
            </p>
            <Link
              to="/register"
              className="inline-block bg-slate-800 text-white rounded px-6 py-3 font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm">
          <p>Cybatech Workforce — a product of Cybatech Solutions</p>
        </div>
      </footer>
    </main>
  )
}

export default LandingPage
