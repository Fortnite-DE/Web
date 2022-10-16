import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {DefaultSeo} from "next-seo";

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <>
        <DefaultSeo
            defaultTitle="Fortnite DE Discord"
            titleTemplate="Fortnite DE Discord | %s"
            description="Der offizielle deutschsprachige Fortnite Discord mit über 220 Tausend Mitgliedern."
            twitter={{
                cardType: "summary",
                site: "@FortniteDE",
            }}
            openGraph={{
                title: "Fortnite DE Discord",
                description: "Der offizielle deutschsprachige Fortnite Discord mit über 220 Tausend Mitgliedern.",
                type: "website",
                url: "https://fn-discord.de",
                images: [
                    {
                        url: "",
                        width: 0,
                        height: 0,
                        alt: "",
                    }
                ],
                locale: "de_DE",
                site_name: "Fortnite DE Discord",
            }}
            additionalMetaTags={[
                {
                    name: "theme-color",
                    content: "#FF342D",
                }
            ]}
        />
        <Component {...pageProps} />
      </>
  )
}

export default MyApp
