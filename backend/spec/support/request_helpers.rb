module Requests
  def current_user
    session = UserSession.find
    session && session.user
  end

  def json
    @json ||= JSON.parse(response.body)
  end
end