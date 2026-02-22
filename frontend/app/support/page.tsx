import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Support</h1>
        <p className="text-gray-600 mb-8">
          We're here to help. Choose your preferred way to get in touch with our team.
        </p>
        
        <div className="space-y-4">
          <a 
            href="mailto:support@dosteon.com" 
            className="flex items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-100 mr-4 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Email Support</div>
              <div className="text-sm text-gray-500">support@dosteon.com</div>
            </div>
          </a>
          
          <div className="flex items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-100 mr-4 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Live Chat</div>
              <div className="text-sm text-gray-500">Available Mon-Fri, 9am-5pm</div>
            </div>
          </div>
          
          <div className="flex items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-100 mr-4 transition-colors">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Phone Support</div>
              <div className="text-sm text-gray-500">+1 (555) 000-0000</div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400">
            &copy; {new Date().getFullYear()} Dosteon. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
