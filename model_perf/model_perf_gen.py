import os
import json
from openai import OpenAI
import pandas as pd
import tqdm
import time

API_KEY = 'sk_KudyH3KCoW5DAZ7k9fpLgQjhPCFLfr44fMs4z2ZvRag'
API_URL = 'https://api.jiekou.ai/openai'


# ====== APIs ======

def call_model(description: str, amount: float, model) -> dict:
    '''Send transaction to local LLM and get category.'''
    prompt = f'''You are a financial assistant. Categorize the following bank transaction.
Respond ONLY with valid JSON in this format: {{"category": "string"}}

Categories: Food, Transport, Shopping, Bills, Health, Entertainment, Income, Transfer, Other

Transaction: "{description}" | Amount: ${amount}
'''
    try:
        client = OpenAI(
            api_key=API_KEY,
            base_url=API_URL,
        )
        response = client.chat.completions.create(
            model=model,
            messages=[{
                'role': 'user',
                'content': prompt
            }]
        )
        data = json.loads(response.choices[0].message.content)
        return {
            'category': data.get('category', 'Other')
        }
    except Exception as e:
        print('error', e)
        return {'category': 'Other', 'error': str(e)}


# ====== helper ======

DATA_DIR = 'data'
LLM_DIR = 'llm'
FILE = 'CLEANED_cleaned_budget_data.csv'

data = pd.read_csv(os.path.join('..', DATA_DIR, FILE))
descs = list(data['description'])
amts = list(data['amount'])
desc_amt = list(zip(descs, amts))
target = list(data['category'])

def test_llm(name, filename, sec=60):
    print('categorizing with model', name)
    categorized = []
    for desc, amt in tqdm.tqdm(desc_amt):
        res = call_model(desc, amt, name)
        if res.get('error'):
            error_msg = str(res.get('error'))
            print('early stoppage, error:', error_msg)
            if error_msg.find('limit') or error_msg.find('rate') or error_msg.find('fast'):
                print('hit rate limit')
            print(f'sleeping for {sec} seconds')
            time.sleep(sec)
        categorized.append(res.get('category'))
    print(f'got {len(categorized)} categorized responses')
    expected = [(x, y, z) for x, y, z in zip(descs, amts, target)]
    print('expected:', expected)
    llm_res = [(x, y, z) for x, y, z in zip(descs, amts, categorized)]
    print(f'{name}:', llm_res)
    correct = 0
    for e, l in zip(expected, llm_res):
        if (e[2] == l[2]):
            correct += 1
    print('accuracy: ', correct / len(categorized))
    df = pd.DataFrame({
        'description': [x[0] for x in llm_res],
        'amount': [x[1] for x in llm_res],
        'category': [x[2] for x in llm_res]
    })
    df.to_csv(os.path.join('..', DATA_DIR, LLM_DIR, f'{filename}.csv'), index=False)

test_llm('gpt-5.4', 'gpt_5_4')
test_llm('gpt-4.1-mini', 'gpt_4_1_mini')
test_llm('gemini-3.1-pro-preview', 'gemini_3_1_pro_preview')
test_llm('claude-opus-4-6', 'claude_opus_4_6')
test_llm('deepseek/deepseek-v3.1', 'deepseek_v3_1')
test_llm('moonshotai/kimi-k2.5', 'kimi_k2_5')

# not good
# test_llm('zai-org/glm-5', 'glm_5') # no good
# test_llm('baidu/ernie-4.5-vl-424b-a47b', 'ernie_4_5') # no good
# test_llm('mistralai/mistral-7b-instruct', 'mistral_7b_instruct') # no good