import { buildMailtoHref } from "@/lib/main";

export default function Footer() {
  return (
    <footer>
      <h2>Get in touch</h2>
      <div className="row">
        <a className="mail" href={buildMailtoHref("priyanshidwivedi436@gmail.com")}>
          priyanshidwivedi436@gmail.com
        </a>
        <div className="socials">
          <a href="https://www.instagram.com/snapwritoo?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.youtube.com/@Snapwritoo" target="_blank" rel="noopener noreferrer">YouTube</a>     
        </div>
      </div>
      <div className="fine">Snapwritoo</div>
    </footer>
  );
}
