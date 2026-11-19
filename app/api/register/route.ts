import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {randomToken,sha256} from "@/lib/security";
export const runtime="nodejs";
export async function POST(req:Request){
 try{
  const b=await req.json();const name=String(b.name||"").trim();const registrationKey=String(b.registrationKey||"");
  if(name.length<2||name.length>100) return NextResponse.json({error:"Укажи имя и фамилию."},{status:400});
  if(!/^[a-f0-9-]{30,40}$/i.test(registrationKey)) return NextResponse.json({error:"Не удалось проверить регистрацию. Обнови страницу и попробуй снова."},{status:400});
  const {data:state}=await supabaseAdmin.from("game_settings").select("*").eq("id",1).single();
  if(!state?.registration_open||state.drawn) return NextResponse.json({error:"Регистрация уже закрыта."},{status:403});
  const {data:existing}=await supabaseAdmin.from("participants").select("id").eq("registration_key",registrationKey).maybeSingle();
  if(existing) return NextResponse.json({error:"С этого браузера участник уже зарегистрирован. Если потерял ссылку, обратись к организатору."},{status:409});
  const token=randomToken();
  const {error}=await supabaseAdmin.from("participants").insert({name,wishes:String(b.wishes||"").slice(0,1000),avoid:String(b.avoid||"").slice(0,1000),notes:String(b.notes||"").slice(0,1000),registration_key:registrationKey,access_token_hash:sha256(token)});
  if(error) throw error;
  const site=(process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin).replace(/\/$/,"");
  return NextResponse.json({personalUrl:`${site}/my?key=${token}`});
 }catch(e:any){console.error(e);return NextResponse.json({error:"Ошибка регистрации. Попробуй ещё раз или обратись к организатору."},{status:500});}
}
