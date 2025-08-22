const Footer = () => {
  return (
    <section className="flex flex-col gap-4 items-center justify-evenly p-5 ">
      <p>
        Do you want to add your edits? It’s okay, make a fork of the repository
        and open a PR.
        <a
          className="Link"
          href="https://github.com/ibrahimwael951/Street-Traffic"
        >
          Repository
        </a>
      </p>
      <p>
        About me?
        <a className="Link" href="https://ibrlolportfoli.vercel.app/">
          Apolo
        </a>
      </p>
    </section>
  );
};

export default Footer;
