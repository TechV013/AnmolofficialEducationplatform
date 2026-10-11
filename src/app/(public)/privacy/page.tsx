import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Design Vidya",
  description: "How we collect, use, and protect your personal data at Design Vidya.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — Design Vidya",
    description: "How we collect, use, and protect your personal data at Design Vidya.",
    type: "website",
    url: "https://www.anmolofficial.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <header className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold uppercase tracking-wide text-text">
            Privacy Policy
          </h1>
          <p className="text-muted text-sm uppercase tracking-widest mt-2">
            Updated on 6 October 2026
          </p>
        </header>

        <p className="text-sm text-muted leading-relaxed text-justify mb-8">
          Design Vidya (&ldquo;Design Vidya&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;) respects your privacy and is committed to protecting the personal
          information of students, learners, instructors, industry experts, visitors, and other
          users (&ldquo;you&rdquo; or &ldquo;your&rdquo;) who access or use our website, online
          courses, learning services, digital content, communication channels, and related
          services (collectively, the &ldquo;Services&rdquo;).
        </p>
        <p className="text-sm text-muted leading-relaxed text-justify mb-8">
          This Privacy Policy explains how Design Vidya collects, uses, stores, processes, shares,
          and protects your personal information when you visit or use our website, platform,
          applications, courses, or other Services. By accessing or using Design Vidya, you
          acknowledge that you have read and understood this Privacy Policy. Where consent is
          required under applicable law, we will obtain your consent before processing your
          personal information for the relevant purpose. If you do not agree with this Privacy
          Policy, please do not access or use our Services.
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            1. About Design Vidya
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Design Vidya operates an online education and learning platform offering courses,
            workshops, masterclasses, mentorship, and related digital learning services. This
            Privacy Policy applies to all visitors, students, learners, instructors, mentors,
            consultants, industry experts, and other users of the Services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            2. Information we collect
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify mb-3">
            We may collect different categories of information depending on how you interact with
            Design Vidya.
          </p>
          <h3 className="text-sm font-semibold text-text mb-2">
            2.1 Information you provide directly
          </h3>
          <p className="text-sm text-muted leading-relaxed text-justify mb-3">
            When you register, purchase a course, contact us, participate in a workshop, apply as
            an expert, or use our Services, we may collect:
          </p>
          <ul className="text-sm text-muted leading-relaxed list-disc pl-6 space-y-1.5 mb-3">
            <li>Full name, email address and mobile number</li>
            <li>Address, city, state and country</li>
            <li>Profile photograph and account information</li>
            <li>Educational qualifications and institution information</li>
            <li>Professional information and work experience</li>
            <li>Areas of interest and specialization</li>
            <li>Course preferences and learning preferences</li>
            <li>Portfolio or professional profile links</li>
            <li>Information submitted through forms</li>
            <li>Reviews, feedback and testimonials</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            3. Information relating to students and learners
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            If you use Design Vidya as a student or learner, we may collect information relating
            to your use of our educational Services, including course enrolments, course progress,
            lessons and videos accessed, assignments submitted, assessment and quiz results,
            certificates earned, learning activity, downloads, search queries, interactions with
            instructors or experts, questions, and feedback. We use this information primarily to
            provide, maintain and improve your learning experience.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            4. Information relating to instructors and industry experts
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            If you register or apply as an instructor, mentor, consultant or industry expert, we
            may collect your professional photograph, professional title, educational
            qualifications, professional experience, areas of expertise, portfolio, professional
            profile links, employment history, certifications, biography, course or workshop
            information, payment and banking information where applicable, tax-related information
            where legally required, and communication or scheduling information. Some professional
            information may be displayed publicly on the Design Vidya website to help students
            discover and connect with relevant experts.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            5. Information collected automatically
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            When you access our Website or Services, certain information may automatically be
            collected, including IP address, browser type, device type, operating system, device
            identifiers, approximate location derived from IP address, date and time of access,
            pages visited, referring website, interaction data, session information, error and
            diagnostic information, cookies and similar technologies. This information helps us
            maintain security, understand platform usage, diagnose technical problems and improve
            our Services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            6. Payment information
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            When you purchase a course, workshop, subscription or other paid Service, payments may
            be processed through third-party payment gateway providers. Depending on the payment
            method, these providers may collect name, billing information, transaction information,
            payment method, transaction reference number and payment status. Design Vidya does not
            intend to store complete debit-card or credit-card numbers or CVV information on its
            own servers unless specifically required and lawfully permitted. Payment information
            may be processed by authorized payment service providers in accordance with their own
            privacy policies and security practices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            7. Information from communications
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            When you contact Design Vidya through email, telephone, WhatsApp, website forms, chat,
            social media or other communication channels, we may collect and retain information
            relating to that communication, including contact details, messages, support requests,
            feedback, complaint information, call or communication records where legally permitted,
            and information voluntarily provided by you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            8. Google Forms and third-party forms
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Design Vidya may use third-party tools such as online forms, including Google Forms,
            for student registration, expert connection requests, masterclass registration, event
            registration, feedback, surveys and applications. Information submitted through such
            services may be processed according to the privacy policies of those providers as well
            as this Privacy Policy. We recommend reviewing the applicable third-party privacy
            policy before submitting information through an external service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            9. How we use your information
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            We may use your Personal Information to create and manage accounts, provide access to
            purchased courses, deliver educational content, track learning progress, conduct
            assessments, issue certificates, provide mentorship or expert interaction, organize
            live classes and events, improve the Website and course content, understand user
            preferences, develop new Services, communicate account and course updates, provide
            customer support, send permitted promotional communications, detect fraud, prevent
            unauthorized access, enforce our Terms of Use, and comply with applicable legal or
            regulatory requirements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            10. Legal basis for processing
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Depending on the circumstances and applicable law, Design Vidya may process Personal
            Information based on your consent, performance of a contract or provision of Services,
            compliance with legal obligations, legitimate business interests where permitted by
            applicable law, protection of rights, safety or property, or another lawful ground
            available under applicable law. Where processing is based on consent, you may withdraw
            your consent subject to applicable legal and contractual limitations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            11. Sharing of personal information
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Design Vidya does not sell your Personal Information as a commodity. We may share
            information with trusted third parties where reasonably necessary to provide our
            Services. These may include website hosting and cloud providers, payment processors,
            email and communication providers, analytics providers, customer support providers,
            video or learning technology providers, cybersecurity providers and other authorized
            service providers. We may also share limited information with instructors, mentors or
            industry experts where necessary to provide an educational service or facilitate a
            connection requested by you. Information may be disclosed to government, law
            enforcement or regulatory authorities where required or permitted by law. In a merger,
            acquisition, restructuring, investment or sale of assets, Personal Information may be
            transferred as part of the transaction, subject to applicable law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            12. Publicly available information
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Certain information may be displayed publicly when you choose to create a public
            profile or participate in public areas of our platform. Expert profiles may display
            name, photograph, professional title, biography, areas of expertise, qualifications,
            professional experience and portfolio or professional links. You should avoid
            publishing sensitive or confidential information in public areas of the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            13. Reviews, testimonials and user content
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            If you voluntarily provide a review, testimonial, feedback, project, portfolio,
            comment or other content to Design Vidya, we may use that content to operate, improve
            or promote our Services, subject to applicable law and any permissions required. Where
            we intend to use identifiable testimonials or photographs for promotional purposes, we
            may obtain appropriate permission where required. Do not submit confidential
            information, another person&rsquo;s personal information, or material that you do not
            have the right to share.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            14. Cookies and similar technologies
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Design Vidya may use cookies and similar technologies for login and authentication,
            remembering preferences, website functionality, analytics, performance monitoring,
            security, personalization and marketing where permitted. You may control cookies
            through your browser settings. Disabling certain cookies may affect functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            15. Data retention
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            We retain Personal Information only for as long as reasonably necessary for providing
            Services, maintaining account records, meeting legal and regulatory obligations,
            resolving disputes, enforcing agreements, preventing fraud and maintaining financial or
            transaction records. When information is no longer required, we may delete, anonymize
            or securely dispose of it, subject to applicable legal requirements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            16. Data security
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Design Vidya takes reasonable technical and organizational measures to protect
            Personal Information against unauthorized access, disclosure, loss, misuse, alteration,
            destruction and accidental disclosure. Security measures may include access controls,
            encryption where appropriate, secure authentication, monitoring, backups and other
            reasonable safeguards. No online system can guarantee absolute security. You are
            responsible for keeping your account credentials confidential and should notify us if
            you believe your account has been compromised.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            17. Children&rsquo;s privacy
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Design Vidya is committed to protecting children&rsquo;s privacy. Where our Services
            are intended for minors or where applicable law requires parental or guardian consent,
            we will take appropriate steps to obtain such consent and process information in
            accordance with applicable law. If you believe that a child has provided Personal
            Information without appropriate authorization, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            18. Your privacy rights
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Subject to applicable law, you may have rights to request access to Personal
            Information held by us, correction of inaccurate information, updating of certain
            information, withdrawal of consent where applicable, deletion where legally applicable,
            information regarding processing, and the ability to raise a grievance or opt out of
            certain promotional communications. Some requests may be subject to legal, contractual
            or technical limitations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            19. Marketing communications
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            You may receive communications regarding new courses, workshops, masterclasses, events,
            discounts, offers, educational resources and platform updates. You may unsubscribe from
            promotional emails using the unsubscribe option or by contacting us. Even if you opt
            out of marketing communications, we may continue sending essential service-related
            communications such as payment confirmations, security alerts and account
            notifications.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            20. Third-party websites and services
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Our Website may contain links to third-party websites, applications, social media
            platforms, payment gateways or other services. Design Vidya is not responsible for the
            privacy practices, content or security of third-party websites. We recommend reviewing
            their privacy policies before providing Personal Information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            21. International data transfers
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Some technology, hosting, communication, analytics or service providers may process
            information outside India. Where Personal Information is transferred outside India, we
            will take reasonable steps to ensure that such processing is carried out in accordance
            with applicable laws and appropriate safeguards.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            22. Data protection and grievance contact
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify mb-3">
            If you have questions, concerns, complaints or requests relating to this Privacy Policy
            or processing of your Personal Information, contact Design Vidya.
          </p>
          <ul className="text-sm text-muted leading-relaxed list-none space-y-1.5">
            <li>
              <span className="font-semibold text-text">Company:</span> Design Vidya
            </li>
            <li>
              <span className="font-semibold text-text">Email:</span>{" "}
              <a
                href="mailto:privacy@designvidya.com"
                className="text-primary hover:underline"
              >
                privacy@designvidya.com
              </a>
            </li>
            <li>
              <span className="font-semibold text-text">Grievance Email:</span>{" "}
              <a
                href="mailto:grievance@designvidya.com"
                className="text-primary hover:underline"
              >
                grievance@designvidya.com
              </a>
            </li>
            <li>
              <span className="font-semibold text-text">Website:</span>{" "}
              <a
                href="https://www.designvidya.com"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.designvidya.com
              </a>
            </li>
            <li>
              <span className="font-semibold text-text">Address:</span> [Registered Office Address]
            </li>
            <li>
              <span className="font-semibold text-text">Grievance Officer / Data Protection Contact:</span>{" "}
              Name: [Name], Designation: [Designation], Email: [Email Address]
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            23. Changes to this Privacy Policy
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            Design Vidya may update this Privacy Policy from time to time to reflect changes in our
            Services, technology, business practices or applicable laws. When changes are made, we
            will update the &ldquo;Last Updated&rdquo; date at the top of this Policy. Where
            required by applicable law, we will provide additional notice or obtain consent before
            implementing material changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            24. Governing law
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            This Privacy Policy shall be governed by and interpreted in accordance with the laws
            applicable in India. Any dispute relating to this Privacy Policy or the Services shall
            be subject to the applicable jurisdiction of the courts specified in the Terms of Use
            of Design Vidya, subject to applicable law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            25. Consent
          </h2>
          <p className="text-sm text-muted leading-relaxed text-justify">
            By using Design Vidya&rsquo;s Website or Services, you acknowledge that you have read
            and understood this Privacy Policy. Where applicable, by selecting &ldquo;I
            Agree&rdquo;, registering for an account, purchasing a course, submitting a form, or
            otherwise providing consent, you agree to the collection and processing of your
            Personal Information as described in this Privacy Policy. If you do not agree with this
            Privacy Policy, please discontinue use of the relevant Services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-text mb-3">
            26. Contact us
          </h2>
          <ul className="text-sm text-muted leading-relaxed list-none space-y-1.5">
            <li>
              <span className="font-semibold text-text">Design Vidya</span>
            </li>
            <li>
              <span className="font-semibold text-text">Email:</span>{" "}
              <a
                href="mailto:privacy@designvidya.com"
                className="text-primary hover:underline"
              >
                privacy@designvidya.com
              </a>
            </li>
            <li>
              <span className="font-semibold text-text">Grievance Email:</span>{" "}
              <a
                href="mailto:grievance@designvidya.com"
                className="text-primary hover:underline"
              >
                grievance@designvidya.com
              </a>
            </li>
            <li>
              <span className="font-semibold text-text">Website:</span>{" "}
              <a
                href="https://www.designvidya.com"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.designvidya.com
              </a>
            </li>
            <li>
              <span className="font-semibold text-text">Phone:</span> [Official Contact Number]
            </li>
          </ul>
        </section>

        <p className="text-sm text-muted leading-relaxed text-justify mt-10">
          Last Updated: 6 October 2026
        </p>
      </div>
    </div>
  );
}
