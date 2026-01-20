import React from "react";
import "./AboutPage.scss";
function AboutPage(props) {
  let handleSaveVoucher = () => {
    props.sendDataFromVoucherItem(props.id);
  };
  return (
    <div className="introduction-container">
      <div className="info-section">
        <h1>K-Shop</h1>
        <h2>Liên Hệ Với Chúng Tôi</h2>
        <form className="contact-form">
          <label htmlFor="name">Họ và tên:</label>
          <input type="text" id="name" name="name" required />

          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />

          <label htmlFor="message">Tin nhắn:</label>
          <textarea id="message" name="message" rows="4" required></textarea>

          <button type="submit">Gửi</button>
        </form>
      </div>
      <div className="map-section">
        <iframe
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.5010244866503!2d105.83847607476773!3d20.972544189707975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac44d5bd46e9%3A0x3d177cc5329a33f0!2zMTIxNyDEkC4gR2nhuqNpIFBow7NuZywgxJDhu4tuaCBDw7RuZywgVGhhbmggWHXDom4sIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1758781083959!5m2!1svi!2s"
          width="600"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}

export default AboutPage;
