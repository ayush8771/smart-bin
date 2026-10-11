import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    Lightbulb,
    Target,
    Eye,
    Users,
    Trash2,
    Trophy,
    Mail,
    Phone,
    MapPin,
    ArrowRight
} from 'lucide-react';

export default function About() {
    const navigate = useNavigate();

    const [isSending, setIsSending] = React.useState(false);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);

        // Grab all the data from the form
        const formData = new FormData(e.target);

        formData.append("access_key", "4057803a-c08b-4527-884b-b79a200618b6");

        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            const data = await res.json();
            if (data.success) {
                alert("Message Sent Successfully! We will get back to you soon.");
                e.target.reset(); // Clears the form fields
            } else {
                alert("Failed to send message. Please try again.");
            }
        } catch (error) {
            alert("An error occurred. Please check your internet connection.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-16">

            {/* =========================================
          ABOUT SECTION
      ========================================= */}

            {/* 1. Headline & Short Paragraph */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-800 text-white py-20 px-4 text-center rounded-b-[3rem] shadow-xl">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 animate-fade-in-up">
                        Revolutionizing Waste Management
                    </h1>
                    <p className="text-lg md:text-xl text-green-50 leading-relaxed opacity-90">
                        SmartBin is an AI-powered platform that transforms how campuses and cities handle waste.
                        By combining Teachable Machine learning with a rewarding incentive system, we make
                        recycling not just a responsibility, but a rewarding habit.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-12 space-y-16">

                {/* 2. Problem & Solution Block */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Problem */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition">
                        <div className="bg-red-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                            <AlertCircle className="text-red-500 w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">The Problem</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Every day, tons of recyclable plastic end up in landfills simply because of improper
                            segregation at the source. Traditional bins offer no guidance or motivation,
                            leading to a massive environmental crisis and wasted resources.
                        </p>
                    </div>

                    {/* Solution */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition">
                        <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                            <Lightbulb className="text-emerald-600 w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Our Solution</h3>
                        <p className="text-slate-600 leading-relaxed">
                            We deploy "Smart Bins" equipped with AI scanning technology. Users simply scan their
                            waste, let our AI classify it (Plastic/Non-Plastic), dispose of it correctly, and
                            earn instant digital wallet rewards for their eco-friendly actions.
                        </p>
                    </div>
                </div>

                {/* 3. Mission & Vision */}
                <div className="bg-emerald-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
                    <div className="grid md:grid-cols-2 gap-12 relative z-10">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Target className="text-emerald-400" /> Our Mission
                            </h3>
                            <p className="text-emerald-50 leading-relaxed">
                                To automate and gamify waste segregation at the grassroots level. We aim to educate
                                communities through immediate AI feedback and incentivize green behavior to build
                                a zero-waste ecosystem.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Eye className="text-emerald-400" /> Our Vision
                            </h3>
                            <p className="text-emerald-50 leading-relaxed">
                                A world where technology bridges the gap between human convenience and environmental
                                sustainability. We envision SmartBins in every college, tech park, and public space
                                across the nation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4. Impact Metrics */}
                <div>
                    <h2 className="text-center text-3xl font-bold text-slate-800 mb-10">Our Impact So Far</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <div className="flex justify-center mb-4"><Users className="text-blue-500 w-10 h-10" /></div>
                            <h4 className="text-4xl font-extrabold text-slate-800 mb-2">500+</h4>
                            <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">Active Eco-Warriors</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <div className="flex justify-center mb-4"><Trash2 className="text-emerald-500 w-10 h-10" /></div>
                            <h4 className="text-4xl font-extrabold text-slate-800 mb-2">1,200kg</h4>
                            <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">Waste Segregated</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <div className="flex justify-center mb-4"><Trophy className="text-yellow-500 w-10 h-10" /></div>
                            <h4 className="text-4xl font-extrabold text-slate-800 mb-2">₹15k+</h4>
                            <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">Rewards Distributed</p>
                        </div>
                    </div>
                </div>

                {/* 5. CTA Button */}
                <div className="text-center pb-12 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Ready to make a difference?</h2>
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:-translate-y-1 hover:shadow-emerald-500/30 flex items-center gap-2 mx-auto"
                    >
                        Join the Movement <ArrowRight size={20} />
                    </button>
                </div>

            </div>

            {/* =========================================
          CONTACT US SECTION
      ========================================= */}

            <div className="max-w-5xl mx-auto px-4 mt-16">
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Get in Touch</h2>

                <div className="grid md:grid-cols-5 gap-8 bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">

                    {/* Contact Info (Left Side - 2 columns wide) */}
                    <div className="md:col-span-2 bg-slate-900 text-white p-10 flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Contact Information</h3>
                            <p className="text-slate-400 mb-8">Reach out to us for college deployments, partnerships, or support queries.</p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-emerald-400 mt-1" size={24} />
                                    <div>
                                        <h4 className="font-semibold text-white">Our Location</h4>
                                        <p className="text-slate-400 text-sm">Dr. Ambedkar Institute of Technology<br />Bengaluru, Karnataka</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Phone className="text-emerald-400 mt-1" size={24} />
                                    <div>
                                        <h4 className="font-semibold text-white">Phone</h4>
                                        <p className="text-slate-400 text-sm">+91 83103 98093</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Mail className="text-emerald-400 mt-1" size={24} />
                                    <div>
                                        <h4 className="font-semibold text-white">Email</h4>
                                        <p className="text-slate-400 text-sm">naavhackers@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <div className="w-16 h-1 bg-emerald-500 rounded-full"></div>
                        </div>
                    </div>

                    {/* Contact Form (Right Side - 3 columns wide) */}
                    <div className="md:col-span-3 p-10">
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                    {/* Added name="First Name" */}
                                    <input type="text" name="First Name" required className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-slate-50" placeholder="John" disabled={isSending} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                    {/* Added name="Last Name" */}
                                    <input type="text" name="Last Name" required className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-slate-50" placeholder="Doe" disabled={isSending} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                {/* Added name="Email" */}
                                <input type="email" name="Email" required className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-slate-50" placeholder="john@example.com" disabled={isSending} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                {/* Added name="Message" */}
                                <textarea name="Message" required rows="4" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-slate-50 resize-none" placeholder="How can we help you?" disabled={isSending}></textarea>
                            </div>

                            {/* Added dynamic button text and disabled state */}
                            <button
                                type="submit"
                                disabled={isSending}
                                className={`font-bold py-3 px-8 rounded-xl transition w-full md:w-auto flex items-center justify-center gap-2
                                    ${isSending ? 'bg-slate-400 cursor-not-allowed text-white' : 'bg-slate-900 hover:bg-emerald-600 text-white'}`}
                            >
                                {isSending ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}