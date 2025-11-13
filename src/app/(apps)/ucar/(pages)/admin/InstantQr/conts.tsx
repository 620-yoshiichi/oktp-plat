export const getSrc = ({sateiID}) => {
  let qrSrc = [
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/1jLzIQGOZOkNYfYlABGnXmRsALGmCETkriV8vI5NU0XI/viewform?usp=pp_url%26entry.1914258596=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/1QeETnZPaVu0I1j7079VOeWgHbFgc0hTJZSU6Z6bRDVE/viewform?usp=pp_url%26entry.1898736198=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/1MHCSbSnJYSDCkRe8ECGOe6ovvXDVXGAPmACs8QjEg7g/viewform?usp=pp_url%26entry.617050577=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/16utr4rniF79fljAFuksGYtJu4YKIRJxJGPZEFuHghEc/viewform?usp=pp_url%26entry.617050577=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/1PC0tZ0UUU7LUyRDknP8zSP6rzDf8l5oFbrTJImLjDzk/viewform?usp=pp_url%26entry.617050577=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/1sj6q6xeVQRZKJpztQDDSVvBUO1zB59eMeVbPz_sxSNg/viewform?usp=pp_url%26entry.617050577=' +
      sateiID,

    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/1izhvAdT7xxVJMJA1SbfuOUfHKKjmoeqoqbUqwp06DN4/viewform?usp=pp_url%26entry.617050577=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=220x220&cht=qr&chl=https://docs.google.com/forms/d/e/1FAIpQLSedY3MC_x6iQ6VKFbxRN1HJCfehVKz056iSI_5AdkW06265PA/viewform?usp=pp_url%26entry.617050577=' +
      sateiID,

    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/17_u7RRVyo4QxNRrij8y5yfociT78Yhuyysgt_0hmkBM/viewform?usp=pp_url%26entry.617050577=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/1bPd9vwIOu_Mz-OKvha9unO6zynwSls5uUitNPxHn5Tg/viewform?usp=pp_url%26entry.617050577=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/1WUz93Nb9yApTnSHeVS44K8RVf0ROw1p1NJnn4sykM5o/viewform?usp=pp_url%26entry.617050577=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/1hBDwD5Hql1BRRDyAB9Rhrk-in0Tc7jP9-WPAKdLmPaU/viewform?usp=pp_url%26entry.617050577=' +
      sateiID,

    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/e/1FAIpQLSdGHNK7o1Q46Qa3LD1HhgiFOUs2nbtmT_EU0GKtsY6_HUliaw/viewform?usp=pp_url&entry.1246640502=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/e/1FAIpQLScUd3rMxbUSAE00keO_P1B2lcqoRgRWSh2WiQnRaMsWImrgkA/viewform?usp=pp_url&entry.1246640502=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/e/1FAIpQLSeeTatfZSoUtWOhV7gXtlSaXl1XOtU2aNysJ8F8H7AoGwY9gQ/viewform?usp=pp_url&entry.1246640502=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/e/1FAIpQLSebre2ByH3VoD80kNABBnbEE4TLeJ-eiVV2jCspIf4OPUPoSw/viewform?usp=pp_url&entry.1246640502=' +
      sateiID,
    'http://chart.apis.google.com/chart?chs=200x200&cht=qr&chl=https://docs.google.com/forms/d/e/1FAIpQLSe9RmtQvODpEtU1RPixhz1tvhjuddTdWc3JOh7LgVhbwdt8QQ/viewform?usp=pp_url&entry.1246640502=' +
      sateiID,
  ]
  qrSrc = qrSrc.map(value => {
    if (typeof value === 'string') {
      const result = String(value).replace('%26', '&')
      return result.replace(/http.+chl=/, '')
    } else {
      return value
    }
  })

  return qrSrc
}
