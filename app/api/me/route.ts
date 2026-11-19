import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {sha256} from "@/lib/security";
export const runtime="nodejs";
export async function GET(req:Request){
 const token=new URL(req.url).searchParams.get("key")||"";
 if(token.length<30)return NextResponse.json({error:"Недействительная личная ссылка."},{status:400});
 const {data:p}=await supabaseAdmin.from("participants").select("id,name").eq("access_token_hash",sha256(token)).maybeSingle();
 if(!p)return NextResponse.json({error:"Ссылка не найдена. Проверь, что скопировал её полностью."},{status:404});
 const {data:settings}=await supabaseAdmin.from("game_settings").select("drawn").eq("id",1).single();
 if(!settings?.drawn)return NextResponse.json({name:p.name,drawn:false});
 const {data:assignment}=await supabaseAdmin.from("assignments").select("recipient_id").eq("giver_id",p.id).maybeSingle();
 if(!assignment)return NextResponse.json({error:"Результат пока недоступен. Обратись к организатору."},{status:404});
const {data:r}=await supabaseAdmin.from("participants").select("name,wishes,avoid,notes").eq("id",assignment.recipient_id).single();

 if(!r){
  return NextResponse.json({error:"Не удалось найти получателя."},{status:404});
 }

 return NextResponse.json({name:p.name,drawn:true,recipient:r.name,recipientWishes:r.wishes,recipientAvoid:r.avoid,recipientNotes:r.notes});
}
