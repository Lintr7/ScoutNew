import React, { useState } from "react"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  
  try {
    const response = await fetch('https://formsubmit.co/scout.tlin@gmail.com', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        email: formData.email,
        message: formData.message,
        _subject: 'New Contact from Scout',
        _captcha: 'false'
      })
    })

    if (response.ok) {
      alert("Message sent successfully!")
      setFormData({ email: "", message: "" })
    } else {
      const errorData = await response.json()
      console.error('Error response:', errorData)
      alert("Failed to send message. Please try again.")
    }
  } catch (error) {
    alert("Error sending message. Please try again.")
    console.error("Error:", error)
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="bg-blue-100/6 border border-blue-500/20 rounded-2xl" style={{ position: 'absolute'}}>
    <section className="text-white py-10 px-7 flex justify-center items-center">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 style={{ fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace"}} className="text-3xl md:text-5xl font-bold mb-4 text-purple-400">Contact Me</h2>
          <p style={{ fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace"}} className="text-blue-200 text-md max-w-2xl mx-auto">
            Got any feedback? We'd love to hear from you!
          </p>
        </div>
        
        <div className="grid md:grid-cols-1 gap-5 items-start">
          {/* Contact Info */}
          <div style={{marginTop: '-2em'}} className="space-y-3">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-800/50 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Email</h4>
                    <a href="mailto:scout.tlin@gmail.com" className="text-blue-300 hover:text-blue-200 transition-colors">
                      scout.tlin@gmail.com
                    </a>
                  </div>
                </div>       
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl p-5 border border-blue-700/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-blue-100">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-blue-950/50 border border-blue-700/20 text-white placeholder:text-blue-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-blue-100">
                  Message
                </label>
                <textarea
                  id="message"
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="max-h-[300px] w-full px-4 py-2 bg-blue-950/50 border border-blue-700/20 text-white placeholder:text-blue-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 min-h-32 resize-y"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
                <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </section>
    </div>
  )
}