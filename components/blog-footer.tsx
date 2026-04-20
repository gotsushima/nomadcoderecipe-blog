"use client"

export function BlogFooter() {
  return (
    <footer className="noto-footer">
      <div className="footer-logo">NCR</div>
      <div className="footer-info">
        Nomad Code Recipe<br />
        AI &amp; Engineering Log<br />
        © {new Date().getFullYear()} nomadcoderecipe
      </div>
    </footer>
  )
}
