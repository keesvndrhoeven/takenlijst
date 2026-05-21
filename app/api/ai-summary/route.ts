import { NextRequest, NextResponse } from 'next/server'
import { Task } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { tasks }: { tasks: Task[] } = await req.json()

  const open = tasks.filter((t) => !t.completed)
  const urgent = tasks.filter((t) => !t.completed && t.urgent)
  const done = tasks.filter((t) => t.completed)

  if (!tasks.length) {
    return NextResponse.json({ summary: 'Nog geen taken. Voeg je eerste taak toe om te beginnen!' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'JOUW_ANTHROPIC_API_KEY_HIER') {
    return NextResponse.json({ summary: fallback(open.length, urgent.length, done.length, urgent) })
  }

  const taskList = open.map((t) => `- ${t.title}${t.urgent ? ' [URGENT]' : ''}`).join('\n') || '(geen open taken)'
  const prompt = `Je bent een productiviteitsassistent. Geef een korte samenvatting in het Nederlands van maximaal 3 zinnen.

Statistieken: ${open.length} open taken, ${urgent.length} urgent, ${done.length} afgerond.
Open taken:
${taskList}

Wees concreet en direct. Benoem wat urgent is. Eindig met één concrete focus-tip voor vandaag. Geen inleiding.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    const text = data.content?.find((c: { type: string }) => c.type === 'text')?.text
    return NextResponse.json({ summary: text || fallback(open.length, urgent.length, done.length, urgent) })
  } catch {
    return NextResponse.json({ summary: fallback(open.length, urgent.length, done.length, urgent) })
  }
}

function fallback(open: number, urgentCount: number, done: number, urgentTasks: Task[]): string {
  let msg = `Je hebt ${open} open ${open === 1 ? 'taak' : 'taken'}`
  if (urgentCount > 0) msg += `, waarvan ${urgentCount} urgent`
  msg += '.'
  if (done > 0) msg += ` Al ${done} ${done === 1 ? 'taak' : 'taken'} afgerond — goed bezig!`
  if (urgentTasks.length > 0) {
    msg += ` Focus vandaag op: "${urgentTasks[0].title}".`
  } else if (open > 0) {
    msg += ' Pak de bovenste taak als eerste aan.'
  } else {
    msg += ' Alles is afgerond, gefeliciteerd!'
  }
  return msg
}
