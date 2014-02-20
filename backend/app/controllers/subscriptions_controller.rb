class SubscriptionsController < ApplicationController
  before_filter :require_user

  def index
    @subscriptions = current_user.subscriptions
  end

  def create
    @subscription = Subscription.new( :user_id => current_user.id,
                                      :show_id => params[:subscription][:show_id]);

    render :nothing => true, :status => 401 unless @subscription.save
  end

  def update
    @subscription = Subscription.find(params[:id])
    if params[:option] == 'first'
      @subscription.episode_id = @subscription.show.episodes.aired.first.id
    elsif params[:option] == 'last'
      @subscription.episode_id = @subscription.show.episodes.aired.last.id
    elsif params[:option] == 'next'
      all_episodes = @subscription.show.episodes
      next_episode_index = @subscription.episode.episode_index + 1
      next_episode = all_episodes.find_by_episode_index( next_episode_index ) || @subscription.episode
      @subscription.episode_id = next_episode.id
    elsif params[:option] == 'custom'
      @subscription.episode_id = params[:episode_id]
    end

    unless @subscription.save
      render :nothing => true, :status => 401
    end
  end

  def delete
    @subscription = Subscription.find(params[:id])
    render :nothing => true, :status => 401 unless @subscription.delete
  end
end
