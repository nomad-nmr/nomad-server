import Announcement from '../../models/announcement.js'

export async function postAnnouncement(req, res) {
  const { title, body, kind } = req.body
  try {
    const cleanTitle = title ? title.trim() : ''
    const cleanBody = body.trim() || ''
    const cleanKind = kind || 'info'
    if (!cleanBody) {
      return res.status(422).send({ error: 'Announcement body is required' })
    }


    const saved = await Announcement.findOneAndUpdate(
      { key: 'homepage-announcement' },
      { key: 'homepage-announcement', title: cleanTitle || '', body: cleanBody, kind: cleanKind},
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )

    return res.status(200).send({ announcement: saved })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'API error' })
  }
}

export async function getAnnouncement(req, res) {
  try {
    const a = await Announcement.findOne({ key: 'homepage-announcement' })
    if (!a) {
      return res.status(200).send({ announcement: null })
    }
    return res.status(200).send({ announcement: a })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'API error' })
  }
}

export async function clearAnnouncement(req, res) {
  try {
    await Announcement.deleteOne({ key: 'homepage-announcement' })
    return res.status(200).send({ ok: true })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'API error' })
  }
}