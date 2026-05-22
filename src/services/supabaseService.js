import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
}

export async function savePipelineRun({
  jobTitle,
  companyName,
  candidateName,
  jobDescription,
  analysis,
  scorecard,
  questions,
  outreach,
  brief
}) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('pipeline_runs')
    .insert([{
      job_title: jobTitle,
      company_name: companyName,
      candidate_name: candidateName,
      job_description: jobDescription,
      analysis,
      scorecard,
      questions,
      outreach,
      brief
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getPipelineRuns() {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('pipeline_runs')
    .select('id, created_at, job_title, company_name,candidate_name')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data
}

export async function getPipelineRunById(id) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('pipeline_runs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deletePipelineRun(id) {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('pipeline_runs')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}