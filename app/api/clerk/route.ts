export async function POST(req) {
    const wh = new Webhook(process.env.SIGNING_SECRET)
    const headerPayload = await headers()
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-timestamp": headerPayload.get("svix-timestamp"),
        "svix-signature": headerPayload.get("svix-signature")
    };
    
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const { data, type } = wh.verify(body, svixHeaders)
    
    // Extract user data based on event type
    const userData = {
        _id: data.id,
        email: data.email_addresses?.[0]?.email_address,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        image: data.image_url,
    }
    
    await connectDB();
    
    switch (type) {
        case 'user.created':
            await User.create(userData)
            break;
        case 'user.updated':
            await User.findByIdAndUpdate(data.id, userData)
            break;
        case 'user.deleted':
            await User.findByIdAndDelete(data.id)
            break;
        case 'session.created':
            // Handle session event - extract user from nested structure
            const sessionUserData = {
                _id: data.user.id,
                email: data.user.email_addresses?.[0]?.email_address,
                name: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim(),
                image: data.user.image_url,
            }
            await User.findByIdAndUpdate(data.user.id, sessionUserData, { upsert: true })
            break;
        default:
            break;
    }
    
    return NextResponse.json({ message: "Event received" })
}
