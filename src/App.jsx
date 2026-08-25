import { useLayoutEffect } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Advantages from "./components/Advantages";
import Contact from "./components/Contact";
import Grainient from "./components/Grainient";
import { initSiteAnim } from "./anim/siteAnim";

function App() {
  useLayoutEffect(() => {
    const ctx = initSiteAnim();
    return () => ctx && ctx.revert();
  }, []);

  return (
    <>
      <div className="site-bg" aria-hidden="true">
        <Grainient />
      </div>
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Advantages />
      </main>
      <Contact />
    </>
  );
}

export default App;
