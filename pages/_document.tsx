import Document, {
  Html,
  Main,
  NextScript,
  DocumentContext,
  Head,
} from "next/document";
import {
  DecoratorComponentsReact,
  fetchDecoratorReact,
  DecoratorEnvProps,
} from "@navikt/nav-dekoratoren-moduler/ssr";
import React from "react";

const decoratorParams: DecoratorEnvProps = {
  env: "dev",
  serviceDiscovery: true,
};

class _Document extends Document<{ decorator: DecoratorComponentsReact }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const decorator = await fetchDecoratorReact(decoratorParams);
    return { ...initialProps, decorator };
  }

  render() {
    const { HeadAssets, Scripts, Header, Footer } = this.props.decorator;
    return (
      <Html>
        <Head />
        <HeadAssets />
        <Scripts />

        <body>
          <Header />
          <Main />
          <Footer />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default _Document;
