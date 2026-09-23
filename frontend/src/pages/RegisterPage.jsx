import { useState } from "react"
import { Link } from "react-router-dom"

function RegisterPage() {
  const whatsappMessage = encodeURIComponent(
    "Hi, I'm interested in Cybatech Workforce for my business."
  )
  const whatsappLink = "https://wa.me/25429698288?text=" + whatsappMessage

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  function handleSubmit(event) {
    event.preventDefault()

    const subject = encodeURIComponent("Cybatech Workforce inquiry from " + name)
    const body = encodeURIComponent(
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Phone: " + phone + "\n\n" +
      message
    )

    window.location.href = "mailto:info@cybatech.co.ke?subject=" + subject + "&body=" + body
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md">
        <h1 className="text-xl font-semibold text-slate-800 mb-2 text-center">
          Get Started with Cybatech Workforce
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          Track attendance across all your business locations, with real
          GPS verification on every clock-in. Reach out and we will get
          your company set up.
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full bg-green-600 text-white rounded py-2.5 text-sm font-medium mb-4 text-center"
        >
          Chat with us on WhatsApp
        </a>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400">or send us a message</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Tell us a bit about your business"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            rows="3"
          />
          <button
            type="submit"
            className="w-full bg-slate-800 text-white rounded py-2.5 text-sm font-medium"
          >
            Send Message
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
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
