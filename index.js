const puppeteer = require("puppeteer");

const LI_AT_COOKIE_KURYLENKO =
  "AQEDAS1XSkcED1vVAAABgZsViKsAAAGBvyIMq00AaMGy_w44ndLc6NVIUm4GxzTjVm09nMEisyfpSi8nlPqcj63yR-naLnFvX5QPJ3AbPKZGfyZTbhBrNMZWvXIJqLcpi_xvK4mInWWsWJCqRIFym1cw";
const LI_AT_COOKIE_ZO =
  "AQEDARj1_bUBtScvAAABgGqL20kAAAGCRTDFZU0AlFiapmAiZQf6TL5Jf1_r5ZYUFjDYltg9zxsvR3wpJX_3sIUncWrYej8ID3Ycqaee6VKASS5sjVy_U7M7hGt7aGigCfHZ6Q7yRDkxdV0GpADkou4J";

const DELAY_OBJECT = { delay: 0.5 + 0.5 * Math.random };

const MY_LI_AT_COOKIE = LI_AT_COOKIE_ZO;
const PROFIL_TO_SEARCH = "développeur web react";
const MESSAGE_TO_SEND = null;
const PAGE_NUMBER = 6;

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 1);
    });
  });
}

async function linkedInBot(
  liAtCookie,
  profilToSearch,
  messageToSend,
  pageNumber
) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.setCookie({
    name: "li_at",
    value: liAtCookie,
    domain: "www.linkedin.com",
  });
  await page.goto("https://www.linkedin.com/");

  /**
   * Maintenant que j'ai changé la taille de la fenetre le champs input est
   * directement dispo, pas besoin de clicker sur la loupe au préalable
   * plus besoin des deux lignes ci-dessous
   */
  //search-global-typeahead__collapsed-search-button
  // await page.click(`.search-global-typeahead__collapsed-search-button`);

  //Ecriture dans la barre de recherche du profil à rechercher
  await page.type(
    ".search-global-typeahead__input.always-show-placeholder",
    profilToSearch,
    {
      delay: 25,
    }
  );

  await page.keyboard.press("Enter", { delay: 862 });

  /**
   * Wait for selector sert à attendre que l'element soit dispo
   * renvoi par defaut une erreur 30s apres s'il ne trouve pas
   * mettre timeout:0 pour retirer ce délai ==> on peux aussi le modifier
   * et catch(error) pour pas arréter l'exécution
   * Ceci est bien meilleur que de faire un setTimeout qui att un delai
   * déterminé est incertain selon la connexion
   */
  await page.waitForSelector("#search-reusables__filters-bar ul li button");

  //Click sur le button de filtre "Personnes" pour afficher les profils
  const [personnesFilterButton] = await page.$x(
    "//button[contains(., 'Personnes')]"
  );
  await personnesFilterButton.click();

  //Attente du chargement de la liste des profils
  await page.waitForSelector(".entity-result__item");

  //TEST n°1 : Clicker sur tous les boutton d'ajout
  if (false) {
    await setTimeout(async () => {
      const allButtons = await page.$$(".entity-result__item div div button");
      console.log("allButtons", allButtons);
      if (allButtons) {
        if (allButtons === []) browser.close();
        for (let i = 0; i < allButtons.length; i++) {
          console.log("i : ", i);
          await allButtons[i].click();
          await page.waitForSelector('button[aria-label="Ignorer"]');
          const closeBtn = await page.$('button[aria-label="Ignorer"]');
          if (closeBtn) {
            await closeBtn.click();
          }
        }
      }
    }, 500);
    await autoScroll(page);
  }

  //TEST n°2 : ICI CA MARCHE TOP
  if (false) {
    await setTimeout(async () => {
      const allButtons = await page.$$(".entity-result__item div div button");
      console.log("allButtons", allButtons);
      if (allButtons) {
        if (allButtons === []) browser.close();
        for (let i = 0; i < allButtons.length; i++) {
          console.log("i : ", i);
          const currentButton = allButtons[i];
          const spanTextContent = await currentButton.$eval(
            ".artdeco-button__text",
            (it) => it.textContent
          );
          console.log("spanTextContent", spanTextContent);
          if (spanTextContent.includes("Se connecter")) {
            await currentButton.click();
            await page.waitForSelector('button[aria-label="Ignorer"]');
            const closeBtn = await page.$('button[aria-label="Ignorer"]');
            if (closeBtn) {
              await closeBtn.click();
            }
          }
        }
      }
    }, 900);
    await autoScroll(page);
  }

  //TEST n°3 : OK  MARCHE TRES BIEN manque juste les pages
  if (false) {
    await page
      .waitForSelector(".entity-result__item div div button", {
        timeout: 900,
      })
      .catch((error) => {
        console.log("no button on this page");
      });
    const allButtons = await page.$$(".entity-result__item div div button");
    console.log("allButtons", allButtons);
    if (allButtons) {
      if (allButtons === []) browser.close();
      for (let i = 0; i < allButtons.length; i++) {
        console.log("i : ", i);
        const currentButton = allButtons[i];
        const spanTextContent = await currentButton.$eval(
          ".artdeco-button__text",
          (it) => it.textContent
        );
        console.log("spanTextContent", spanTextContent);
        if (spanTextContent.includes("Se connecter")) {
          await currentButton.click();
          await page.waitForSelector('button[aria-label="Ignorer"]');
          const closeBtn = await page.$('button[aria-label="Ignorer"]');
          if (closeBtn) {
            await closeBtn.click();
          }
        }
      }
    }
    //GO NEXT PAGE
    await autoScroll(page);
    await page.waitForSelector(
      ".artdeco-pagination.artdeco-pagination--has-controls.ember-view.pv5.ph2 ul + button"
    );
    const nextButton = await page.$(
      ".artdeco-pagination.artdeco-pagination--has-controls.ember-view.pv5.ph2 ul + button"
    );
    await nextButton.click();
  }

  //----------------------
  // .entity-result__item div div button    le button pour ajouter
  //TEST n°4 : MARCHE NICKEL POUR AJOUTER EN AMIS SANS MESSAGE
  if (
    messageToSend === undefined ||
    messageToSend === null ||
    messageToSend.length < 1
  ) {
    for (let p = 1; p < pageNumber; p++) {
      console.log("p :", p);
      await page
        .waitForSelector(
          ".entity-result__actions.entity-result__divider div button",
          {
            timeout: 1500,
          }
        )
        .catch((error) => {
          console.log("no button on this page");
        });
      const allButtons = await page.$$(
        ".entity-result__actions.entity-result__divider div button"
      );
      console.log("allButtons", allButtons);
      if (allButtons) {
        if (allButtons === []) browser.close();
        for (let i = 0; i < allButtons.length; i++) {
          console.log("i : ", i);
          const currentButton = allButtons[i];
          const spanTextContent = await currentButton.$eval(
            ".artdeco-button__text",
            (it) => it.textContent
          );
          console.log("spanTextContent", spanTextContent);
          if (spanTextContent.includes("Se connecter")) {
            await currentButton.click(DELAY_OBJECT);
            await page.waitForSelector(
              'button[aria-label="Envoyer maintenant"]'
            );
            const sendInvitation = await page.$(
              'button[aria-label="Envoyer maintenant"]'
            );
            if (sendInvitation) {
              await sendInvitation.click(DELAY_OBJECT);
            }
          }
        }
      }
      //GO NEXT PAGE
      await autoScroll(page);
      await page.waitForSelector(
        ".artdeco-pagination.artdeco-pagination--has-controls.ember-view.pv5.ph2 ul + button"
      );
      const nextButton = await page.$(
        ".artdeco-pagination.artdeco-pagination--has-controls.ember-view.pv5.ph2 ul + button"
      );
      await nextButton.click();
    }
  }

  //TEST n°5 : OK ! FONCTIONNE NICKEL AVEC MESSAGE ET GESTION DES PAGES =) ^.^
  if (messageToSend != undefined && messageToSend.length > 1) {
    for (let p = 1; p < pageNumber; p++) {
      console.log("p :", p);
      await page
        .waitForSelector(
          ".entity-result__actions.entity-result__divider div button",
          {
            timeout: 1500,
          }
        )
        .catch((error) => {
          console.log("no button on this page");
        });
      const allButtons = await page.$$(
        ".entity-result__actions.entity-result__divider div button"
      );
      console.log("allButtons", allButtons);
      if (allButtons) {
        if (allButtons === []) browser.close();
        for (let i = 0; i < allButtons.length; i++) {
          console.log("i : ", i);
          const currentButton = allButtons[i];
          const spanTextContent = await currentButton.$eval(
            ".artdeco-button__text",
            (it) => it.textContent
          );
          console.log("spanTextContent", spanTextContent);
          if (spanTextContent.includes("Se connecter")) {
            await currentButton.click();
            await page.waitForSelector('button[aria-label="Ignorer"]');
            const closeBtn = await page.$('button[aria-label="Ignorer"]');
            if (closeBtn) {
              await page.waitForSelector(
                'button[aria-label="Ajouter une note"]'
              );
              const addMessageBtn = await page.$(
                'button[aria-label="Ajouter une note"]'
              );
              if (addMessageBtn) {
                await addMessageBtn.click();
                await page.waitForSelector("#custom-message");
                await page.type("#custom-message", messageToSend, {
                  delay: 15,
                });

                await page.waitForSelector(
                  'button[aria-label="Envoyer maintenant"]'
                );
                const sendBtn = await page.$(
                  'button[aria-label="Envoyer maintenant"]'
                );
                await sendBtn.click();
              } else {
                await closeBtn.click();
              }
            }
          }
        }
      }
      //GO NEXT PAGE
      await autoScroll(page);
      await page.waitForSelector(
        ".artdeco-pagination.artdeco-pagination--has-controls.ember-view.pv5.ph2 ul + button"
      );
      const nextButton = await page.$(
        ".artdeco-pagination.artdeco-pagination--has-controls.ember-view.pv5.ph2 ul + button"
      );
      await nextButton.click();
    }
  }
}

linkedInBot(MY_LI_AT_COOKIE, PROFIL_TO_SEARCH, MESSAGE_TO_SEND, PAGE_NUMBER);
