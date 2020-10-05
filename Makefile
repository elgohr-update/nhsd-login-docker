build:
	@docker build -t artronics/nhsd-login-docker:latest .

run:
	@docker run --rm -it artronics/nhsd-login-docker:latest $(ARGS)
