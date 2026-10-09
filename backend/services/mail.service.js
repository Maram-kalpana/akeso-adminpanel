const nodemailer =
  require("nodemailer");

require("dotenv").config();


const transporter =
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(
      process.env.SMTP_PORT || 587
    ),

    secure:
      String(
        process.env.SMTP_SECURE
      ) === "true",

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });


function emailTemplate({
  name,
  heading,
  description,
  buttonText,
  actionUrl,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f4f8f8;
    font-family:Arial,Helvetica,sans-serif;
  "
>

<table
  width="100%"
  cellspacing="0"
  cellpadding="0"
  style="padding:35px 15px;"
>
<tr>
<td align="center">

<table
  width="100%"
  cellspacing="0"
  cellpadding="0"
  style="
    max-width:600px;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    border:1px solid #e1ebea;
  "
>

  <!-- HEADER -->

  <tr>
    <td
      align="center"
      style="
        padding:28px 30px 22px;
        border-bottom:3px solid #C8942E;
      "
    >

      <div
        style="
          font-size:24px;
          font-weight:700;
          color:#064B50;
        "
      >
        Akeso Global
        <span style="color:#C8942E;">
          Medical Services
        </span>
      </div>

      <div
        style="
          margin-top:7px;
          font-size:12px;
          color:#708283;
        "
      >
        Healing Beyond Borders
      </div>

    </td>
  </tr>


  <!-- BODY -->

  <tr>
    <td
      style="
        padding:38px 38px 35px;
      "
    >

      <h2
        style="
          margin:0;
          color:#064B50;
          font-size:23px;
          line-height:1.4;
        "
      >
        ${heading}
      </h2>


      <p
        style="
          margin:18px 0 0;
          color:#4f6061;
          font-size:15px;
          line-height:1.8;
        "
      >
        Hello <strong>${name}</strong>,
      </p>


      <p
        style="
          margin:10px 0 0;
          color:#4f6061;
          font-size:15px;
          line-height:1.8;
        "
      >
        ${description}
      </p>


      <table
        cellspacing="0"
        cellpadding="0"
        style="margin-top:27px;"
      >
        <tr>
          <td
            bgcolor="#C8942E"
            style="
              border-radius:8px;
            "
          >

            <a
              href="${actionUrl}"
              style="
                display:inline-block;
                padding:15px 25px;
                color:#ffffff;
                font-size:14px;
                font-weight:700;
                text-decoration:none;
              "
            >
              ${buttonText}
            </a>

          </td>
        </tr>
      </table>


      <p
        style="
          margin:28px 0 7px;
          color:#7b898a;
          font-size:12px;
          line-height:1.6;
        "
      >
        If the button doesn't work,
        copy and paste this link into
        your browser:
      </p>


      <p
        style="
          margin:0;
          word-break:break-all;
          font-size:12px;
          line-height:1.6;
        "
      >
        <a
          href="${actionUrl}"
          style="
            color:#C8942E;
          "
        >
          ${actionUrl}
        </a>
      </p>


      <div
        style="
          margin-top:30px;
          padding:14px 16px;
          background:#f4f8f8;
          border-left:3px solid #064B50;
          color:#667879;
          font-size:12px;
          line-height:1.7;
        "
      >
        For your security, this link
        expires in 24 hours.
      </div>

    </td>
  </tr>


  <!-- FOOTER -->

  <tr>
    <td
      align="center"
      style="
        padding:20px 30px;
        background:#064B50;
        color:#d8e4e4;
        font-size:11px;
        line-height:1.7;
      "
    >
      © ${new Date().getFullYear()}
      Akeso Global Medical Services.
      All rights reserved.
    </td>
  </tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}


async function sendMail({
  to,
  subject,
  html,
}) {
  return transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
}


exports.sendActivationEmail =
  async ({
    name,
    email,
    token,
  }) => {

    const url =
      `${process.env.FRONTEND_URL}/set-password?token=${encodeURIComponent(
        token
      )}`;

    return sendMail({
      to: email,

      subject:
        "Set your password to activate your Akeso account",

      html: emailTemplate({
        name,

        heading:
          `Welcome to Akeso Global Medical Services, ${name}!`,

        description:
          "Your account has been created. Click the button below to set your password and activate your account.",

        buttonText:
          "Set your password",

        actionUrl: url,
      }),
    });
  };


exports.sendResetPasswordEmail =
  async ({
    name,
    email,
    token,
  }) => {

    const url =
      `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(
        token
      )}`;

    return sendMail({
      to: email,

      subject:
        "Reset your Akeso password",

      html: emailTemplate({
        name,

        heading:
          `Reset your Akeso password, ${name}`,

        description:
          "We received a request to reset your password. Click the button below to choose a new password.",

        buttonText:
          "Reset your password",

        actionUrl: url,
      }),
    });
  };