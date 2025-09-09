'use client'
import { NextPage } from "next";
import styles from '@/css/infopages.module.css'
import { BottomBar } from "@/components/BottomBar/BottomBar";
import { TopBar } from "@/components/TopBar/TopBar";
import { useEffect, useState } from "react";

const Faq: NextPage = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = "VerifierPlus Home page";
  }, []);

  return (
    <main className={styles.main}>
      <TopBar hasLogo={true} isDark={isDark} setIsDark={setIsDark}/>
      <div className={styles.textContent}>
        <h1 className={styles.title}>VerifierPlus Frequently Asked Questions</h1>
        <h2 id="trust">Why trust us?</h2>
        <p>The Digital Credentials Consortium is a member organization comprised of <a href='https://digitalcredentials.mit.edu/#dcc-members'>leading universities</a> in North America and Europe that are working together to create an infrastructure for digital academic credentials that can support the education systems of the future.</p>
        <p>This website implements <a href='https:/https://github.com/digitalcredentials'>open source libraries</a> that support open technical standards for supported digital credentials.</p>
        <p>This service is maintained by <a href='https://openlearning.mit.edu'>MIT Open Learning</a> at the Massachusetts Institute of Technology. Please contact verifierplus-support -at- mit -dot- edu with any questions.</p>

        <h2 id="supported">What formats of digital academic credentials are supported?</h2>
        <p>VerifierPlus supports digital academic credentials:</p>
        <ul>
          <li>Using the W3C Verifiable Credential Data Model v1.1.</li>
          <li>Expressed as Open Badges v3</li>
        </ul>
        

        <p>In addition, credentials must support the following standards and specifications for full verification:</p>
        <ul>
          <li>The issuer must exist in a supported registry.</li>
          <li>The issuer and subject decentralized identifiers must be either did:key or did:web</li>
          <li>The appropriate cryptographic signing method must be used</li>
        </ul>
        

        <h2>What is a {"Public Link"}?</h2>
        <p>Users of the Learner Credential Wallet mobile app are able to “<a href='https://lcw.app/faq.html#public-link'>Create Public Links</a>” if they wish to share a credential from their wallet to anyone with the link. Please see the <a href='https://lcw.app/faq.html'>Learner Credential Wallet FAQ</a> for more information.</p>
          
        <h2>Who do I contact if I have more questions?</h2>
        <p>For questions about the VerifierPlus please email verifierplus-support -at- mit -dot- edu.</p>
        <p>To learn more about the DCC please visit us at <a href='https://digitalcredentials.mit.edu'>digitalcredentials.mit.edu</a>.</p>

      </div>
      <BottomBar isDark={isDark}/>
    </main>
  );
}

export default Faq;
