export async function sendWelcomeEmail(name: string, email: string) {
  try {
    console.log(`Welcome, ${name}
      Your email [${email}] has been added to our mailing list.
      `);
  } catch (err) {
    console.error(`Could not send email to ${email}. ${err}`);
  }
};