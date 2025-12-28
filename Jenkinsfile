pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'aquawatch'
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/YassirBenjima/AquaWatch.git', branch: 'main'
            }
        }

        stage('Build Microservices') {

            parallel {
                stage('Build Alert Service') {
                    steps {
                        dir('alert-service') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/alert-service:latest .'
                        }
                    }
                }
                stage('Build MQTT Gateway') {
                    steps {
                        dir('mqtt-gateway') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/mqtt-gateway:latest .'
                        }
                    }
                }
                stage('Build Satellite Service') {
                    steps {
                        dir('satellite-service') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/satellite-service:latest .'
                        }
                    }
                }
                stage('Build Frontend') {

                    steps {
                        dir('frontend') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/frontend:latest .'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline successfully completed!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
