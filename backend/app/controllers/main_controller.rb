class MainController < ApplicationController
  layout false

  def landing
    redirect_to app_path if current_user
  end

  def app
    redirect_to root_url unless current_user
  end
end
