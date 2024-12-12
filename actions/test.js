'use server'

export async function test(formData) {
    const parsedResult = Object.fromEntries(formData)
    console.log(parsedResult);
    return parsedResult
}