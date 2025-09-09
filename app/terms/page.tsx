'use client'
import { NextPage } from "next";
import styles from '@/css/infopages.module.css'
import { BottomBar } from "@/components/BottomBar/BottomBar";
import { TopBar } from "@/components/TopBar/TopBar";
import { useEffect, useState } from "react";

const Terms: NextPage = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = "VerifierPlus Home page";
  }, []);

  return (
    <main className={styles.main}>
      <TopBar hasLogo={true} isDark={isDark} setIsDark={setIsDark}/>
      <div className={styles.textContent}>
        <h1 className={styles.title}>TERMS AND CONDITIONS OF USE</h1>
            <p >Welcome to the VerifierPlus site (the “Site”). The Site is an open source digital credential verification and public sharing website developed by the <a href="https://digitalcredentials.mit.edu">Digital Credentials Consortium</a>, a network of leading international universities designing an open infrastructure for academic credentials. By accessing this Site, users agree to be bound by the following terms and conditions which may be revised at any time. Users are encouraged to visit this page periodically to review the current terms and conditions, as your continued use of this Site signifies your agreement to these term and conditions. If you do not understand or do not agree to be bound by these terms and conditions, please exit this Site immediately.</p>
            <ol>
                <li ><p >When used to verify a supported digital credential, the Site may collect or retain personally identifiable information about you. Please see our <a href="privacy">Privacy Policy</a> for additional information.</p></li>
                <li ><p >When used with the <a href="https://lcw.app/">Learner Credential Wallet</a>, the Site may collect or retain personally identifiable information about you that you have chosen to share. Please see our <a href="privacy">Privacy Policy</a> for additional information.</p></li>
                <li ><p >The text, images, trademarks, data, audio files, video files and clips, and other documentation on the Site, as well as the infrastructure used to provide the Site, (collectively the “Materials”) are protected by copyright and may be covered by other restrictions as well. VerifierPlus retains all rights, including copyright, in the Materials. Copyright and other proprietary rights may be held by individuals or entities, other than, or in addition to, VerifierPlus.</p></li>
                <li ><p >“VerifierPlus” and its logos and seal are property of the Massachusetts Institute of Technology (MIT). Except for purposes of attribution, you may not use the VerifierPlus’ name or logo, or any variations thereof, without prior written consent of VerifierPlus. You may not use the VerifierPlus name in any of its forms nor VerifierPlus logos for promotional purposes, or in any way that deliberately or inadvertently claims, suggests, or in the VerifierPlus’ sole judgment gives the appearance or impression of a relationship with or endorsement by VerifierPlus.</p></li>
                <li ><p >Without limiting the foregoing, all Materials on the Site are provided “AS IS” WITHOUT A WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, COPYRIGHT OWNERSHIP AND/OR NON-INFRINGEMENT OF OTHER THIRD PARTY PROPRIETARY RIGHTS. VerifierPlus does not warrant the Site will operate in an uninterrupted or error-free manner or that the Site is free of viruses or other harmful components. Use of information obtained from or through this Site is at your own risk. Your access to or download of videos, information, materials, or data through the Site or any reference sites is at your own discretion and risk and that you will be solely responsible for any damage to your property (including your computer system) or loss of data that results from the download or use of such material or data.</p></li>
                <li ><p >NEITHER MIT, ITS AFFILIATES, TRUSTEES, DIRECTORS, OFFICERS, EMPLOYEES AND AGENTS SHALL HAVE ANY LIABIITY FOR ANY DAMAGES, INCLUDING WITHOUT LIMITATION, ANY DIRECT, INDIRECT, INCIDENTIAL, COMPENSATORY, PUNITIVE, SPECIAL OR CONSEQUENTIAL DAMAGES (EVEN IF MIT HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES) ARISING FROM OR RELATED TO THE USE OF THE WEBSITES, CONTENT, AND/OR COMPILATION.</p></li>
                <li ><p >You agree to defend, hold harmless and indemnify MIT and its officers, agents, and employees from and against any third-party claims, actions or demands arising out of, resulting from or in any way related to your use of the Site, including any liability or expense arising from any and all claims, losses, damages (actual and consequential), suits, judgments, litigation costs and attorneys&apos; fees, of every kind and nature.</p></li>
                <li ><p >These terms and conditions constitute the entire agreement between you and MIT with respect to your use of the Site, superseding any prior agreements between you and MIT regarding your use of the Site. The failure of MIT to exercise or enforce any right or provision of the terms and conditions shall not constitute a waiver of such right or provision. If any provision of the terms and conditions is found by a court of competent jurisdiction to be invalid, the parties nevertheless agree that the court should endeavor to give effect to the parties&apos; intentions as reflected in the provision, and the other provisions of the terms and conditions remain in full force and effect.</p></li>
                <li ><p >You agree that any dispute arising out of or relating to these terms and conditions or any content posted to a Site will be governed by the laws of the Commonwealth of Massachusetts, excluding its conflicts of law provisions. You further consent to the personal jurisdiction of and exclusive venue in the federal and state courts located in and serving Boston, Massachusetts as the legal forum for any such dispute.</p></li>
            </ol>
            <p >Effective Date September 14, 2022</p>
      </div>
      <BottomBar isDark={isDark}/>
    </main>
  );
}

export default Terms;
