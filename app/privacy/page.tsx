'use client'
import { NextPage } from "next";
import styles from '@/css/infopages.module.css'
import { BottomBar } from "@/components/BottomBar/BottomBar";
import { TopBar } from "@/components/TopBar/TopBar";
import { useEffect, useState } from "react";

const Privacy: NextPage = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = "VerifierPlus Home page";
  }, []);

  return (
    <main className={styles.main}>
      <TopBar hasLogo={true} isDark={isDark} setIsDark={setIsDark}/>
      <div className={styles.textContent}>
        <div>
          <h1 className={styles.title}>VerifierPlus Privacy Policy</h1>
          <h2>Introduction</h2>
            <p>VerifierPlus is an open source open source digital credential verification and public sharing website developed by the <a href="https://digitalcredentials.mit.edu">Digital Credentials Consortium</a>, a network of leading international universities designing an open infrastructure for academic credentials.</p>
            <p>This Privacy Policy explains how VerifierPlus collects, uses, and processes personal information about its learners.</p>
          <h2>What Personal Information We Collect</h2>
            <p>Verifier Plus only collects the information you voluntarily provide. VerifierPlus has no control over what personal information may be included in the digital credential used with VerifierPlus. Categories of personal information that may be included and collected by VerifierPlus during the verification process include the following: Name, Email Address, Credential Data.</p>
          	<p>Additionally, to provide you with access to VerifierPlus, we collect your IP address.</p>
          <h2>How We Collect Personal Information</h2>
            <p>We collect information, including personal information, when you use VerifierPlus.</p>
            <p>We also collect information, including personal information, when you chose to create a Public Link that shares credential data from <a href="https://lcw.app/">Learner Credential Wallet</a> to VerifierPlus.</p>
            <p>We may log the IP address, operating system, page visit behavior, and browser software used by each user of the Site, and we may be able to determine from an IP address a user's Internet Service Provider and the geographic location of their point of connectivity.</p>
          <h2>How We Use Your Personal Information</h2>
            <p>We collect, use and process your personal information (1) to process transactions requested by you; (2) to facilitate DCC's legitimate interests; and/or (3) with your explicit consent, where applicable.</p>
          <h2>When We Share Your Personal Information</h2>
            <p>We will share information we collect (personal information) with third parties providing services on behalf of VerifierPlus, including MongoDB. You can review MongoDB's <a href="https://www.mongodb.com/legal/privacy-policy">privacy policy</a>.</p>
          <h2>How Your Personal Information is Stored and Secured</h2>
            <p>VerifierPlus is designed to protect personal information in its possession or control. This is done through a variety of privacy and security policies, processes, and procedures, including administrative, physical, and technical safeguards that reasonably and appropriately protect the confidentiality, integrity, and availability of the personal information that it receives, maintains, or transmits. Nonetheless, no method of transmission over the Internet or method of electronic storage is 100% secure, and therefore we do not guarantee its absolute security.</p>
          <h2>How Long We Keep Your Personal Information</h2>
            <p>We will maintain a record of all personal information collected to enable your use of the Site for a period of thirty (30) days. Once created, all Public Links are set to expire after a period of one (1) year. Before this automatic deletion, you can unshare your Public Link from the credential used to create it in your Learner Credential Wallet, or you may send a request to delete your Public Link or personal information to verifierplus-support -at- mit -dot- edu and provide a copy of the Public Link itself. However, please be advised that if you submit a request to delete your Public Link, it cannot be reset.</p>
          <h2>Additional Information</h2>
           <p>We may change this Privacy Policy from time to time. If we make any significant changes in the way we treat your personal information we will make this clear on our website or by contacting you directly.</p>
          <p>The controller for your personal information is the VerifierPlus project at MIT. We can be contacted at verifierplus-support -at- mit -dot- edu.</p>
        </div>
      </div>
      <BottomBar isDark={isDark}/>
    </main>
  );
}

export default Privacy;
