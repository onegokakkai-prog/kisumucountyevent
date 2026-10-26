import { ProfessionalForm } from "@/app/professionals/professional-form";
import { RegisterForm } from "@/app/register/register-form";
import { getContent } from "@/lib/content";
import { toFormTabs, toProfessionalForm, toRegistrationForm } from "@/lib/registration-form";
import { Container, Eyebrow, SectionTitle } from "../ui";
import { FormTabs } from "./form-tabs";

export async function RegisterSection() {
  const content = await getContent();
  const { festival, register } = content;
  return (
    <section id="register" aria-labelledby="register-title" className="scroll-mt-16">
      <div className="bg-navy text-white">
        <Container className="flex flex-col gap-3.5 pt-24 pb-[120px] sm:pt-[100px]">
          <Eyebrow className="text-sun">{register.fee ? `Registration · ${register.fee}` : "Registration"}</Eyebrow>
          <SectionTitle id="register-title" className="text-white">
            {register.title}
          </SectionTitle>
          <p className="max-w-[600px] text-lg leading-normal text-haze">
            {register.body}
          </p>
        </Container>
      </div>

      <div className="bg-mist">
        <Container className="-mt-20 flex flex-col gap-8 pb-24 lg:flex-row-reverse lg:items-start">
          <div className="min-w-0 flex-1 rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(11,36,64,0.12)] sm:p-10">
            <FormTabs
              labels={toFormTabs(content)}
              visitor={<RegisterForm form={toRegistrationForm(content)} />}
              professional={<ProfessionalForm form={toProfessionalForm(content)} />}
            />
          </div>

          <aside className="flex flex-col gap-4 lg:w-[360px] lg:flex-none lg:pt-[100px]">
            <section
              aria-labelledby="details-title"
              className="flex flex-col gap-[18px] rounded-[20px] border border-line bg-white p-7"
            >
              <h3 id="details-title" className="text-[19px] font-bold">
                Festival details
              </h3>
              <dl className="flex flex-col gap-3.5">
                <div>
                  <dt className="text-[13px] font-bold tracking-[0.06em] text-muted uppercase">Dates</dt>
                  <dd className="mt-1 text-base font-semibold">
                    {festival.dateLabel}
                    <span className="block text-sm font-normal text-muted">{festival.dateDetail}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] font-bold tracking-[0.06em] text-muted uppercase">Gates</dt>
                  <dd className="mt-1 text-base font-semibold">{festival.gates}</dd>
                </div>
                <div>
                  <dt className="text-[13px] font-bold tracking-[0.06em] text-muted uppercase">Venue</dt>
                  <dd className="mt-1 text-base font-semibold">{festival.venue}, Kisumu County</dd>
                </div>
                {register.fee ? (
                  <div>
                    <dt className="text-[13px] font-bold tracking-[0.06em] text-muted uppercase">Registration fee</dt>
                    <dd className="mt-1 text-base font-semibold">{register.fee}</dd>
                  </div>
                ) : null}
              </dl>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Kisumu+Central+Grounds"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center self-start text-base font-bold text-navy underline underline-offset-4"
              >
                Open in Google Maps
              </a>
            </section>
            <section aria-labelledby="help-title" className="flex flex-col gap-2.5 rounded-[20px] bg-navy p-7 text-white">
              <h3 id="help-title" className="text-[19px] font-bold">
                Need help registering?
              </h3>
              <p className="text-base leading-normal text-haze">Call or WhatsApp the festival team.</p>
              <a href={`tel:${festival.phone}`} className="py-1.5 font-display text-2xl font-extrabold text-sun">
                {festival.phoneLabel}
              </a>
            </section>
          </aside>
        </Container>
      </div>
    </section>
  );
}
