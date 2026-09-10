import { Link } from "react-router-dom"

function RegisterPage() {
  const whatsappMessage = encodeURIComponent(
    "Hi, I'm interested in Cybatech Workforce for my business."
  )
  const whatsappLink = "https://wa.me/25429698288?text=" + whatsappMessage

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          Get Started with Cybatech Workforce
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Track attendance across all your business locations, with real
          GPS verification on every clock-in. Reach out and we will get
          your company set up.
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full bg-green-600 text-white rounded py-2.5 text-sm font-medium mb-4"
        >
          Chat with us on WhatsApp
        </a>

        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}

export default RegisterPage
