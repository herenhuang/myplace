import { NextRequest, NextResponse } from 'next/server'

// Hardcoded list of Luma attendees for Wednesday event
// TODO: Replace this with your actual Luma attendee list
const LUMA_ATTENDEES: Record<string, string> = {
  // Format: 'email@example.com': 'First Name',
  'meow': 'HelenTest',
  'ade.teleola@gmail.com': 'Teleola',
  'annachangji@gmail.com': 'Anna',
  'anunath096@gmail.com': 'Anu',
  'apaar186@gmail.com': 'Apaar',
  'bahatidamien5@gmail.com': 'Bahati',
  'balvinn@gmail.com': 'Balvinn',
  'benparada23@gmail.com': 'Ben',
  'betelhem.l.a@gmail.com': 'Betty',
  'bleung9@gmail.com': 'Bosco',
  'bryan.chang@sap.com': 'Bryan',
  'chidera.maduka@gmail.com': 'Christopher',
  'chikkistepper@gmail.com': 'Chikodili',
  'cibichess@gmail.com': 'Cibi',
  'cjeon94@gmail.com': 'CJ',
  'codons.wording06@icloud.com': 'Ved',
  'daisyle2510@gmail.com': 'Daisy',
  'daraakinwumi@gmail.com': 'Dara',
  'david.an251@gmail.com': 'David',
  'david120wang@gmail.com': 'Davie',
  'dike.dominic@gmail.com': 'Austin',
  'eswanni16@gmail.com': 'Esha',
  'foluwa007@icloud.com': 'Foluwa',
  'francisaldel@gmail.com': 'Francis',
  'giselle.ghaffari@gmail.com': 'Giselle',
  'hjanday01@gmail.com': 'Harpreet',
  'irisguopm@gmail.com': 'Iris',
  'itsaziamery@gmail.com': 'Azia',
  'ivanchau11@gmail.com': 'Ivan',
  'jessieinto@hotmail.com': 'Jessie',
  'jiangzihaoalex@gmail.com': 'Zihao',
  'johnny.libenzon329@gmail.com': 'Johnny',
  'julian.tse1997@hotmail.com': 'Julian',
  'kaihlee8@gmail.com': 'Kai',
  'kaivalya.gandhi@gmail.com': 'Kai',
  'karanarjunb@gmail.com': 'Karan',
  'kat.p28@gmail.com': 'Katya',
  'korayem@ready4vc.com': 'Ahmed',
  'likaatan10@gmail.com': 'Lika',
  'luciazhang981@gmail.com': 'Lucia',
  'm.razavitoussi@gmail.com': 'Melody',
  'mcneely.tom@gmail.com': 'Tom',
  'mila.kh@gmail.com': 'Mila',
  'muhammad.mohsin2013@gmail.com': 'Mo',
  'nadiahle@gmail.com': 'Nadia',
  'newton@epropel.ca': 'Newton',
  'ngoqbrian@gmail.com': 'Brian',
  'nguyeenteresa@gmail.com': 'Teresa',
  'nino@immitracker.app': 'Nino',
  'ozaibak@gmail.com': 'Omar',
  'panayiote7327@gmail.com': 'Pano',
  'preshavtadak@gmail.com': 'Precious',
  'rinnmaximus@gmail.com': 'Rinn',
  'roxy@roxyshi.com': 'Roxy',
  'sarali.for@gmail.com': 'SaraLi',
  'sarmad.ahmad1@gmail.com': 'Sarmad',
  'sarmilans@gmail.com': 'Milan',
  'sefunmi@joincolab.io': 'Sefunmi',
  'sethi.ishmeet@gmail.com': 'Ishmeet',
  'shaiyankhan@gmail.com': 'Shaiyan',
  'sherryzxning@gmail.com': 'Sherry',
  'shopnilrahman82@gmail.com': 'Shopnil',
  'somindylee@gmail.com': 'Mindy',
  'sophia11you@gmail.com': 'Sophia',
  't.shaheen4444@gmail.com': 'Tamer',
  'triet.nguyen1607@icloud.com': 'Triet',
  'umai.balendra@gmail.com': 'Umai',
  'vitalii@stanwith.me': 'Vitalii',
  'vlc.francisaldel@gmail.com': 'Troy',
  'wamfa6441@gmail.com': 'Wamfa',
  'wzy950618@gmail.com': 'Zeyi',
  'xu1302@gmail.com': 'Cherrol',
  'yusuf@zevenue.com': 'Yusuf'
  // Add your actual attendees here
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const name = LUMA_ATTENDEES[normalizedEmail]

    if (name) {
      // Email found in Luma list
      return NextResponse.json({
        success: true,
        found: true,
        name: name
      })
    } else {
      // Email not found
      return NextResponse.json({
        success: true,
        found: false
      })
    }
  } catch (error) {
    console.error('Error in check-email endpoint:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
