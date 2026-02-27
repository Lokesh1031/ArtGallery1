import React from 'react';
import { useLocation } from 'react-router-dom';
import './InfoPages.css';

const InfoPages = () => {
  const location = useLocation();
  const page = location.pathname.substring(1); // Remove leading slash

  const pageContent = {
    faq: {
      title: "Frequently Asked Questions",
      content: (
        <>
          <h3>General Questions</h3>
          <div className="faq-item">
            <h4>How do I purchase artwork?</h4>
            <p>Browse our gallery, select the artwork you like, add it to your cart, and proceed to checkout. You can pay using UPI or other payment methods.</p>
          </div>
          <div className="faq-item">
            <h4>Are the artworks original?</h4>
            <p>Yes, all artworks in our gallery are original pieces created by verified artists.</p>
          </div>
          <div className="faq-item">
            <h4>Can I return an artwork?</h4>
            <p>Yes, we have a 7-day return policy. Please refer to our Returns page for more details.</p>
          </div>
          <div className="faq-item">
            <h4>How long does delivery take?</h4>
            <p>Delivery typically takes 5-7 business days within India. International orders may take 10-15 business days.</p>
          </div>
        </>
      )
    },
    shipping: {
      title: "Shipping & Delivery",
      content: (
        <>
          <h3>Delivery Information</h3>
          <p>We offer shipping across India and internationally. All artworks are carefully packaged to ensure safe delivery.</p>
          
          <h3>Shipping Times</h3>
          <ul>
            <li><strong>Within India:</strong> 5-7 business days</li>
            <li><strong>International:</strong> 10-15 business days</li>
          </ul>

          <h3>Shipping Costs</h3>
          <p>Free shipping on orders above ₹42,500. For orders below this amount, shipping charges will be calculated at checkout.</p>

          <h3>Tracking Your Order</h3>
          <p>Once your order is shipped, you will receive a tracking number via email to monitor your delivery.</p>
        </>
      )
    },
    packaging: {
      title: "Packaging & Framing",
      content: (
        <>
          <h3>Professional Packaging</h3>
          <p>We take utmost care in packaging your artwork. All pieces are:</p>
          <ul>
            <li>Protected with acid-free materials</li>
            <li>Wrapped in bubble wrap and protective covering</li>
            <li>Secured in sturdy cardboard boxes</li>
            <li>Insured for safe transit</li>
          </ul>

          <h3>Framing Services</h3>
          <p>We offer professional framing services for an additional cost. Contact us at care@artgallery.in for framing options and pricing.</p>

          <h3>Installation Guidance</h3>
          <p>Each artwork comes with installation instructions. For large or heavy pieces, we can arrange professional installation.</p>
        </>
      )
    },
    corporate: {
      title: "Corporate Orders",
      content: (
        <>
          <h3>Art for Your Business</h3>
          <p>Transform your office space with curated artworks that reflect your brand values and inspire your team.</p>

          <h3>Benefits</h3>
          <ul>
            <li>Bulk order discounts available</li>
            <li>Customized art curation services</li>
            <li>Flexible payment terms</li>
            <li>Professional installation services</li>
            <li>GST invoices provided</li>
          </ul>

          <h3>Get Started</h3>
          <p>Contact our corporate team at care@artgallery.in or call +91 8074386797 to discuss your requirements.</p>
        </>
      )
    },
    returns: {
      title: "Returns & Refunds",
      content: (
        <>
          <h3>Return Policy</h3>
          <p>We offer a 7-day return policy from the date of delivery. If you're not satisfied with your purchase, you can return it for a full refund.</p>

          <h3>Return Conditions</h3>
          <ul>
            <li>Artwork must be in original condition</li>
            <li>Original packaging must be intact</li>
            <li>Certificate of authenticity must be returned</li>
            <li>Return shipping costs are borne by the buyer unless the item is damaged or incorrect</li>
          </ul>

          <h3>Refund Process</h3>
          <p>Once we receive and inspect the returned artwork, your refund will be processed within 5-7 business days to your original payment method.</p>

          <h3>How to Return</h3>
          <p>Contact us at care@artgallery.in with your order number to initiate a return.</p>
        </>
      )
    },
    help: {
      title: "Buying Process & Help",
      content: (
        <>
          <h3>How to Buy Art</h3>
          <div className="step-guide">
            <div className="step">
              <h4>Step 1: Browse</h4>
              <p>Explore our gallery and discover artworks that speak to you. Use filters to narrow your search by category, price, or artist.</p>
            </div>
            <div className="step">
              <h4>Step 2: Select</h4>
              <p>Click on any artwork to view details, including size, materials, and provenance. Add your favorites to the cart.</p>
            </div>
            <div className="step">
              <h4>Step 3: Checkout</h4>
              <p>Review your cart, enter shipping details, and proceed to payment.</p>
            </div>
            <div className="step">
              <h4>Step 4: Payment</h4>
              <p>Pay securely using UPI or other payment methods. You'll receive a confirmation email immediately.</p>
            </div>
            <div className="step">
              <h4>Step 5: Delivery</h4>
              <p>Your artwork will be carefully packaged and shipped. Track your order online.</p>
            </div>
          </div>

          <h3>Need Help?</h3>
          <p>Contact us at care@artgallery.in or call +91 8074386797 (11am-7pm IST, Mon-Sat)</p>
        </>
      )
    },
    track: {
      title: "Track Your Order",
      content: (
        <>
          <h3>Order Tracking</h3>
          <p>Once your order is shipped, you will receive an email with tracking details.</p>

          <h3>Check Order Status</h3>
          <p>You can also check your order status by:</p>
          <ul>
            <li>Logging into your account and viewing "My Orders"</li>
            <li>Using the tracking number provided in your shipping confirmation email</li>
            <li>Contacting our support team at care@artgallery.in</li>
          </ul>

          <h3>Order Timeline</h3>
          <ul>
            <li><strong>Order Placed:</strong> Confirmation email sent</li>
            <li><strong>Processing:</strong> Artist prepares artwork for shipping (1-2 days)</li>
            <li><strong>Shipped:</strong> Tracking number provided</li>
            <li><strong>In Transit:</strong> 5-7 business days for domestic delivery</li>
            <li><strong>Delivered:</strong> Sign for your package</li>
          </ul>
        </>
      )
    },
    'why-sell': {
      title: "Why Sell With Us?",
      content: (
        <>
          <h3>Join Our Artist Community</h3>
          <p>Art Gallery provides a platform for artists to showcase and sell their work to a global audience.</p>

          <h3>Benefits for Artists</h3>
          <ul>
            <li><strong>95% Commission:</strong> You keep 95% of the sale price</li>
            <li><strong>Direct Payments:</strong> Receive payments directly to your UPI account</li>
            <li><strong>Global Reach:</strong> Access to collectors worldwide</li>
            <li><strong>Zero Listing Fees:</strong> List your artwork for free</li>
            <li><strong>Marketing Support:</strong> We promote your work through our channels</li>
            <li><strong>Verified Profile:</strong> Build credibility with buyer reviews</li>
          </ul>

          <h3>Getting Started</h3>
          <p>Register as an artist, upload your artworks, set your prices, and start selling. It's that simple!</p>
          
          <p><a href="/register?role=artist" className="cta-button">Register as Artist</a></p>
        </>
      )
    },
    'artist-faq': {
      title: "Artist FAQ's",
      content: (
        <>
          <h3>Artist Questions</h3>
          <div className="faq-item">
            <h4>How do I register as an artist?</h4>
            <p>Click on "Register" and select "Artist" as your role. Fill in your details and wait for admin approval.</p>
          </div>
          <div className="faq-item">
            <h4>What commission do you charge?</h4>
            <p>We charge only 5% commission. You receive 95% of the sale price directly to your UPI account.</p>
          </div>
          <div className="faq-item">
            <h4>How do I receive payments?</h4>
            <p>Buyers pay directly to your verified UPI account. No delays, no intermediaries.</p>
          </div>
          <div className="faq-item">
            <h4>Can I set my own prices?</h4>
            <p>Yes, you have complete control over pricing your artworks.</p>
          </div>
        </>
      )
    },
    shows: {
      title: "Participate in Shows",
      content: (
        <>
          <h3>Virtual & Physical Exhibitions</h3>
          <p>We regularly organize exhibitions to showcase our artists' work to collectors and art enthusiasts.</p>

          <h3>Upcoming Shows</h3>
          <p>Check back soon for information about upcoming exhibitions and participation opportunities.</p>

          <h3>How to Participate</h3>
          <p>Registered artists will be notified about upcoming shows via email. You can also contact us at care@artgallery.in to express your interest.</p>

          <h3>Benefits</h3>
          <ul>
            <li>Increased visibility for your work</li>
            <li>Networking opportunities</li>
            <li>Featured in promotional materials</li>
            <li>Direct interaction with collectors</li>
          </ul>
        </>
      )
    },
    about: {
      title: "Who Are We?",
      content: (
        <>
          <h3>About Art Gallery</h3>
          <p>Art Gallery is India's premier online platform connecting artists with art collectors worldwide. We believe in making art accessible while ensuring fair compensation for artists.</p>

          <h3>Our Mission</h3>
          <p>To create a transparent, artist-friendly marketplace where creativity meets commerce. We empower artists to showcase their work and earn fairly while providing collectors with authentic, quality artworks.</p>

          <h3>What Makes Us Different</h3>
          <ul>
            <li><strong>Artist-First:</strong> 95% commission goes to artists</li>
            <li><strong>Direct Payments:</strong> Artists receive payments directly</li>
            <li><strong>Quality Curation:</strong> Every artwork is reviewed for authenticity</li>
            <li><strong>Secure Platform:</strong> Safe and transparent transactions</li>
            <li><strong>Customer Support:</strong> Dedicated team available to help</li>
          </ul>

          <h3>Our Values</h3>
          <p>Transparency, fairness, creativity, and community are at the heart of everything we do.</p>
        </>
      )
    },
    press: {
      title: "Press & Events",
      content: (
        <>
          <h3>Latest News</h3>
          <p>Stay updated with our latest exhibitions, artist features, and platform updates.</p>

          <h3>Media Inquiries</h3>
          <p>For press releases, interviews, or media partnerships, please contact:</p>
          <p>Email: care@artgallery.in<br />
          Phone: +91 8074386797</p>

          <h3>Upcoming Events</h3>
          <p>Check back soon for information about upcoming art events and exhibitions.</p>
        </>
      )
    },
    careers: {
      title: "Careers",
      content: (
        <>
          <h3>Join Our Team</h3>
          <p>We're always looking for passionate individuals who love art and technology.</p>

          <h3>Open Positions</h3>
          <p>Currently, we are accepting applications for:</p>
          <ul>
            <li>Art Curator</li>
            <li>Customer Support Specialist</li>
            <li>Digital Marketing Manager</li>
            <li>Full Stack Developer</li>
          </ul>

          <h3>Why Work With Us?</h3>
          <ul>
            <li>Work in the exciting intersection of art and technology</li>
            <li>Flexible work environment</li>
            <li>Competitive compensation</li>
            <li>Growth opportunities</li>
          </ul>

          <h3>Apply Now</h3>
          <p>Send your resume to care@artgallery.in with the position title in the subject line.</p>
        </>
      )
    },
    terms: {
      title: "Terms & Conditions",
      content: (
        <>
          <h3>Terms of Service</h3>
          <p>By using Art Gallery, you agree to the following terms and conditions.</p>

          <h3>User Accounts</h3>
          <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities under your account.</p>

          <h3>Purchases</h3>
          <p>All purchases are final unless otherwise specified in our return policy. Prices are in Indian Rupees (INR) and are subject to change without notice.</p>

          <h3>Artist Responsibilities</h3>
          <p>Artists warrant that they have the right to sell the artworks they upload and that the artworks are original creations.</p>

          <h3>Intellectual Property</h3>
          <p>All artworks remain the intellectual property of the respective artists. Buyers purchase the physical artwork but not the copyright unless explicitly stated.</p>

          <h3>Limitation of Liability</h3>
          <p>Art Gallery acts as a platform connecting buyers and sellers. We are not responsible for disputes between parties.</p>

          <p className="legal-update">Last updated: February 2026</p>
        </>
      )
    },
    privacy: {
      title: "Privacy Policy",
      content: (
        <>
          <h3>Your Privacy Matters</h3>
          <p>We are committed to protecting your personal information and your right to privacy.</p>

          <h3>Information We Collect</h3>
          <ul>
            <li>Personal information (name, email, phone number)</li>
            <li>Payment information (securely processed)</li>
            <li>Browsing data and cookies</li>
            <li>Artwork preferences and purchase history</li>
          </ul>

          <h3>How We Use Your Information</h3>
          <ul>
            <li>Process your orders and payments</li>
            <li>Communicate with you about your orders</li>
            <li>Send promotional emails (you can opt-out)</li>
            <li>Improve our platform and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h3>Information Sharing</h3>
          <p>We do not sell your personal information. We share information only with:</p>
          <ul>
            <li>Artists (for order fulfillment)</li>
            <li>Payment processors (for transactions)</li>
            <li>Service providers (for shipping and delivery)</li>
          </ul>

          <h3>Data Security</h3>
          <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>

          <h3>Your Rights</h3>
          <p>You have the right to access, update, or delete your personal information. Contact us at care@artgallery.in for data requests.</p>

          <p className="legal-update">Last updated: February 2026</p>
        </>
      )
    },
    environment: {
      title: "Environment Policy",
      content: (
        <>
          <h3>Our Commitment to Sustainability</h3>
          <p>We believe in protecting our planet while promoting art. Our environmental initiatives include:</p>

          <h3>Sustainable Packaging</h3>
          <ul>
            <li>Recyclable and biodegradable packaging materials</li>
            <li>Minimal use of plastic</li>
            <li>Reusable packaging where possible</li>
          </ul>

          <h3>Artist Support</h3>
          <p>We encourage our artists to use eco-friendly materials and sustainable practices in their creative process.</p>

          <h3>Carbon Footprint</h3>
          <ul>
            <li>Optimized shipping routes to reduce emissions</li>
            <li>Partnership with eco-conscious delivery services</li>
            <li>Digital-first operations to minimize paper use</li>
          </ul>

          <h3>Community Initiatives</h3>
          <p>We support environmental causes through:</p>
          <ul>
            <li>Portion of proceeds donated to environmental organizations</li>
            <li>Promotion of eco-themed art exhibitions</li>
            <li>Educational content on sustainable art practices</li>
          </ul>
        </>
      )
    },
    'payment-policy': {
      title: "Payment Policy",
      content: (
        <>
          <h3>Secure & Transparent Payments</h3>
          <p>We offer multiple secure payment options for your convenience.</p>

          <h3>Payment Methods</h3>
          <ul>
            <li><strong>UPI:</strong> Pay directly to artist's verified UPI account</li>
            <li><strong>Razorpay:</strong> Credit/Debit cards, Net Banking, Wallets</li>
          </ul>

          <h3>Payment Process</h3>
          <p>For UPI Payments:</p>
          <ol>
            <li>Review your order and proceed to checkout</li>
            <li>Scan the artist's QR code or use their UPI ID</li>
            <li>Complete payment in your UPI app</li>
            <li>Upload payment screenshot for verification</li>
            <li>Admin verifies and confirms your order</li>
          </ol>

          <h3>Payment Security</h3>
          <p>All transactions are encrypted and secure. We never store your payment card information.</p>

          <h3>Refunds</h3>
          <p>Refunds are processed within 5-7 business days to your original payment method. See our Returns policy for details.</p>

          <h3>Pricing</h3>
          <p>All prices are in Indian Rupees (INR) and include applicable taxes. Shipping charges are calculated at checkout.</p>
        </>
      )
    }
  };

  const content = pageContent[page] || {
    title: "Page Not Found",
    content: <p>The page you're looking for doesn't exist.</p>
  };

  return (
    <div className="info-page">
      <div className="info-header">
        <h1>{content.title}</h1>
      </div>
      <div className="info-content">
        {content.content}
      </div>
    </div>
  );
};

export default InfoPages;
