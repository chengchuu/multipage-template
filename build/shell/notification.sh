#!/bin/bash
:<<EOF
Multipage Template CICD Shell Script
@Cheng
EOF

set -e

echo "[CI] Start"

# Robot KEY https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx
qyApiUrl="https://qyapi.weixin.qq.com/cgi-bin/webhook/send"
key="xxx"
bannerImageUrl="https://xxx.jpg"
# Number of QA&PM xxx xxx
qaMobile="xxx"
pmMobile="xxx"
# Branch Name
branch=${CI_COMMIT_REF_NAME}
# prod test pre
branchPrefix=${CI_COMMIT_REF_NAME%%"-"*}
# Submit Log/The title of the commit. The full first line of the message.
commitTitle=${CI_COMMIT_TITLE}
realTitle=${commitTitle#*": "}
realTitle=${realTitle#*":"}
# Project Address
url=${CI_PROJECT_URL}
pipeUrl=${CI_PIPELINE_URL}
# User Info 175
userId=${GITLAB_USER_ID}
# E-Mail/E-Mail：${userEmail}
userEmail=${GITLAB_USER_EMAIL}
# User Name/The name of the user who started the job. GITLAB_USER_LOGIN / GITLAB_USER_NAME
user=${GITLAB_USER_NAME}
# Running Stage/notification
stage=${CI_JOB_STAGE}
# the Relative of Env and Branch
envName="Unknown Env"
case ${branch} in
    # Production Branch - begin
    "prod-1")
        envName="One"
        ;;
    "prod-2")
        envName="Two"
        ;;
    "prod-3")
        envName="Three"
        ;;
    "prod-4")
        envName="Four"
        ;;
    "prod-5")
        envName="Five"
        ;;
    "prod-6")
        envName="Six"
        ;;
    "prod-7")
        envName="Seven"
        ;;
    # Production Branch - end
    # Test Branch - begin
    "test-1")
        envName="One"
        ;;
    "test-2")
        envName="Two"
        ;;
    "test-3")
        envName="Three"
        ;;
    "test-4")
        envName="Four"
        ;;
    "test-5")
        envName="Five"
        ;;
    "test-6")
        envName="Six"
        ;;
    "test-7")
        envName="Seven"
        ;;
    "test-8")
        envName="Eight"
        ;;
    # Test Branch - end
    *)
        echo "CI Unknown Branch"
        ;;
esac

# Determine Flow
# Merge Code
if [ ${stage} = "merge_code" ]; then
    echo "CI Merge Code"
    curl --location --request POST "${qyApiUrl}?key=xxx" \
    --header 'Content-Type: application/json' \
    --data-raw "{
                    \"msgtype\": \"text\",
                    \"text\": {
                        \"content\" : \"Merge code to main branch (${branch}), mind!\nSubmit info: ${realTitle}\",
                        \"mentioned_list\" : [\"@all\"]
                    }
                }"
# Start Deploy
elif [ ${stage} = "start_ci" ]; then
    curl --location --request POST "${qyApiUrl}?key=${key}" \
    --header 'Content-Type: application/json' \
    --data-raw "{
                    \"msgtype\": \"markdown\",
                    \"markdown\": {
                        \"content\" : \"\`#update\` \`#production\` \`#CI\`\nFront-End Updating 🙏 🙏🏻 🙏🏼 [-> GitLab CI/CD Pipelines ↓](${pipeUrl})\n<font color=comment>${pipeUrl}</font>\"
                    }
                }"
# Complete Deploy
elif [ ${stage} = "after_deploy" ]; then
    # Test/Pre
    if [ ${branchPrefix} = "test" -o ${branchPrefix} = "pre" ]; then
        curl --location --request POST "${qyApiUrl}?key=${key}" \
        --header 'Content-Type: application/json' \
        --data-raw "{
                        \"msgtype\": \"markdown\",
                        \"markdown\": {
                            \"content\" : \"🔔🔊Ding~Test [${envName}] Updated✔️\nContent: ${realTitle}\n<font color=comment>Contact: *@${user}*</font>\"
                        }
                    }"
    # Production
    elif [ ${branchPrefix} = "prod" ]; then
        curl --location --request POST "${qyApiUrl}?key=${key}" \
        --header 'Content-Type: application/json' \
        --data-raw "{
                        \"msgtype\": \"news\",
                        \"news\": {
                        \"articles\" : [
                                {
                                    \"title\" : \"Front-End Updated\",
                                    \"description\" : \"Env: ${envName}\nBranch: ${branch}\nAddress: ${url}\nOperator: ${user}\nContent: ${realTitle}\",
                                    \"url\" : \"${url}/-/pipelines\",
                                    \"picurl\" : \"${bannerImageUrl}\"
                                }
                            ]
                        }
                    }"
    fi
# Notification
elif [ ${stage} = "at_qa_pm" ]; then
    curl --location --request POST "${qyApiUrl}?key=${key}" \
    --header 'Content-Type: application/json' \
    --data-raw "{
                    \"msgtype\": \"text\",
                    \"text\": {
                        \"content\" : \"Copy 📞 📞 📞\",
                        \"mentioned_mobile_list\" : [${qaMobile}, ${pmMobile}]
                    }
                }"
fi

echo "\n[CI] End"
