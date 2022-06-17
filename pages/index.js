import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import * as cheerio from "cheerio";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.scss";

export async function getServerSideProps() {
  const origVaxTypes = [
    " -- Select Appointment Type -- ",
    "J&J",
    "J&J Booster ",
    "Moderna Booster",
    "Moderna Immunocompromised (Additional)",
    "Moderna Primary Series 1st Dose ",
    "Moderna Primary Series 2nd Dose ",
    "Pfizer Booster ",
    "Pfizer Immunocompromised (Additional)",
    "Pfizer Pediatric Booster APPOINTMENT ONLY",
    "Pfizer Pediatric Primary Series 1st Dose ",
    "Pfizer Pediatric Primary Series 2nd Dose ",
    "Pfizer Primary Series 1st Dose ",
    "Pfizer Primary Series 2nd Dose",
  ];

  let vaxTypes = [];
  const result = await axios
    .get("https://www.essexcountynjvaccination.org/vaccine/list")
    .then(function (res) {
      const $ = cheerio.load(res.data);
      $("form select")
        .find("option")
        .each((i, op) => {
          vaxTypes.push($(op).text());
        });
      return vaxTypes;
    })
    .catch(function (error) {
      console.log(error);
    });

  const sameVax = JSON.stringify(result) === JSON.stringify(origVaxTypes);
  return { props: { sameVax } };
}

export default function Home(props) {
  const { sameVax } = props;
  const router = useRouter();

  const sendNotification = (data) => {
    if (data == undefined || !data) {
      return false;
    }
    const title = data.title === undefined ? "Notification" : data.title;
    const clickCallback = data.clickCallback;
    const message = data.message === undefined ? "null" : data.message;
    const icon =
      data.icon === undefined
        ? "https://cdn2.iconfinder.com/data/icons/mixed-rounded-flat-icon/512/megaphone-64.png"
        : data.icon;
    const sendNotification = () => {
      const notification = new Notification(title, {
        icon: icon,
        body: message,
      });
      if (clickCallback !== undefined) {
        notification.onclick = function () {
          clickCallback();
          notification.close();
        };
      }
    };

    if (!window.Notification) {
      return false;
    } else {
      if (Notification.permission === "default") {
        Notification.requestPermission(function (p) {
          if (p !== "denied") {
            sendNotification();
          }
        });
      } else {
        sendNotification();
      }
    }
  };

  // Call this function whenever you want to
  // refresh props!
  const refreshData = () => {
    router.replace(router.asPath);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      !sameVax && sendNotification({
        title: "MODERNA VACCINE",
        message: "Vax Site Changed",
        icon: "https://cdn4.iconfinder.com/data/icons/coronavirus-flat/64/doctor-advise-warning-suggestion-avatar-128.png",
        clickCallback: function () {
          alert("do something when clicked on notification");
        },
      }) && playAudio();
      refreshData();
    }, 480000);

    return () => clearInterval(interval);
  });
  
  const playAudio = () => {
      const audio = new Audio('/abomb.mp3');
      audio.play();
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>Check Essex Vax</title>
        <meta name="description" content="Generated by create next app" />
      </Head>
      <main className={styles.main}>
        {sameVax && <h1 className={styles.vaxSame}>FALSE</h1>}
        {!sameVax && <h1 className={styles.vaxChanged}>TRUE!!!</h1>}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
